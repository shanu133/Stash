import os
import time
# Trigger reload
import json
import glob
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import yt_dlp
import shutil
from static_ffmpeg import add_paths
add_paths()

# 1. Load Keys
load_dotenv()

# 2. Configure AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# 3. Configure Spotify
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET")
))

app = FastAPI(title="Stash Engine API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReelRequest(BaseModel):
    url: str

@app.get("/")
def health_check():
    return {"status": "Antigravity Engine Online 🟢"}


from shazamio import Shazam

@app.post("/recognize")
async def recognize_reel(request: ReelRequest):
    print(f"🚀 Processing URL: {request.url}")
    
    # --- STEP 1: METADATA CHECK (The Fast Path) ---
    try:
        ydl_opts = {
            'quiet': True, 
            'no_warnings': True,
            'extract_flat': True, # Faster for metadata
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)
            track = info.get('track') or info.get('title')
            artist = info.get('artist') or info.get('uploader')
            
            # If metadata looks good (and isn't just "Original Audio"), verify and return
            if track and "Original Audio" not in track and artist:
                print(f"✅ Metadata Match: {track} by {artist}")
                spotify_result = search_spotify_strict(track, artist)
                if spotify_result:
                    return spotify_result
    except Exception as e:
        print(f"⚠️ Metadata extraction skipped: {e}")

    # 1. DOWNLOAD AUDIO
    audio_filename = download_audio(request.url)
    if not audio_filename:
        raise HTTPException(status_code=500, detail="Failed to download audio")

    try:
        # Upload to Gemini
        print(f"📤 Uploading audio {audio_filename} to Gemini...")
        audio_file = genai.upload_file(path=audio_filename)
        
        # Wait for processing
        count = 0
        while audio_file.state.name == "PROCESSING" and count < 30:
            time.sleep(1)
            audio_file = genai.get_file(audio_file.name)
            count += 1

        if audio_file.state.name != "ACTIVE":
            raise Exception("Gemini processing failed or timed out")

        # Prompt the AI
        print("🧠 Asking Gemini...")
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content([
            "Listen to this audio. Identify the song name and artist. "
            "Ignore remixes, speed changes, or voiceovers. "
            "Return ONLY JSON: {'track': 'Name', 'artist': 'Name'}",
            audio_file
        ])
        
        # Parse AI Response
        text_response = response.text.strip()
        if '```json' in text_response:
            text_response = text_response.split('```json')[1].split('```')[0].strip()
        elif '```' in text_response:
             text_response = text_response.split('```')[1].split('```')[0].strip()
        
        ai_data = json.loads(text_response)
        
        print(f"🤖 AI Found: {ai_data}")
        
        # Verify with Spotify
        final_result = search_spotify_strict(ai_data.get('track'), ai_data.get('artist'))
        
        # Cleanup Gemini file
        try:
            genai.delete_file(audio_file.name)
            print("🗑️ Gemini file deleted")
        except:
            pass

        # Cleanup local file
        if os.path.exists(audio_filename):
            os.remove(audio_filename)
        
        if final_result:
            return final_result
        else:
            return {"success": False, "error": "Song found by AI but not in Spotify"}

    except Exception as e:
        print(f"❌ Error: {e}")
        if os.path.exists(audio_filename): os.remove(audio_filename)
        raise HTTPException(status_code=500, detail=str(e))

def download_audio(url):
    """Downloads Instagram audio. Falls back to direct format if FFmpeg is missing."""
    try:
        filename = f"temp_{int(time.time())}"
        has_ffmpeg = shutil.which("ffmpeg") is not None
        
        ydl_opts = {
            'quiet': True, 'no_warnings': True,
        }

        if has_ffmpeg:
            print("🎞️ FFmpeg detected. Downloading mp3...")
            ydl_opts.update({
                'format': 'bestaudio/best',
                'outtmpl': filename,
                'postprocessors': [{'key': 'FFmpegExtractAudio','preferredcodec': 'mp3'}],
            })
        else:
            print("⚠️ FFmpeg NOT detected. Downloading direct audio...")
            ydl_opts.update({
                'format': 'bestaudio',
                'outtmpl': f"{filename}.%(ext)s",
            })

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        files = glob.glob(f"{filename}*")
        return files[0] if files else None
    except Exception as e:
        print(f"Download Error: {e}")
        return None

def search_spotify_strict(track, artist):
    # Search with keywords (broader than strict field match, but sorted by popularity)
    query = f"{track} {artist}" 
    results = sp.search(q=query, type='track', limit=5)
    items = results['tracks']['items']
    
    if not items: return {"success": False, "error": "Not found on Spotify"}

    # SORT BY POPULARITY (Fixes the "Cover Song" issue)
    items.sort(key=lambda x: x['popularity'], reverse=True)
    best = items[0]
    
    print(f"🎯 Spotify Match (Popularity {best['popularity']}): {best['name']} by {best['artists'][0]['name']}")

    return {
        "success": True,
        "track": best['name'],
        "artist": best['artists'][0]['name'],
        "album_art": best['album']['images'][0]['url'],
        "spotify_uri": best['uri'],
        "spotify_url": best['external_urls']['spotify'],
        "preview_url": best.get('preview_url'), 
        "confidence": 0.99
    }

class SaveWebTrackRequest(BaseModel):
    token: str
    track_id: str
    playlist_id: str

# Helper: AI Genre Detection
def detect_genre_with_gemini(track_name, artist_name):
    try:
        prompt = f"What is the primary music genre of the song '{track_name}' by '{artist_name}'? Return only ONE word (e.g., Techno, House, Pop, Rock, Ambient). Do not write sentences."
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text.strip().replace(".", "")
    except Exception as e:
        print(f"⚠️ Gemini Genre Error: {e}")
        return "Unknown"

class AnalyzeVibeRequest(BaseModel):
    songs: list[str] # List of "Song - Artist" strings

@app.post("/analyze_vibe")
def analyze_vibe_summary(request: AnalyzeVibeRequest):
    print(f"🔮 Analyzing Vibe for {len(request.songs)} songs...")
    if not request.songs:
        return {"vibe": "No music yet! Start stashing to find your vibe."}
    
    try:
        song_list = ", ".join(request.songs[:20]) # Limit to last 20 to save tokens
        prompt = f"Here is a user's recently liked music: {song_list}. In one short, fun sentence (max 10 words), describe their current 'music vibe' or mood. Be creative like Spotify Wrapped. Example: 'Melancholic late-night techno drive by yourself.'"
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        vibe = response.text.strip()
        print(f"✨ Vibe Result: {vibe}")
        return {"vibe": vibe}
    except Exception as e:
        print(f"❌ Vibe Error: {e}")
        return {"vibe": "Eclectic and mysterious."}

@app.post("/save_track")
def save_track_to_spotify(request: SaveWebTrackRequest):
    print(f"💾 Saving Track: {request.track_id} to Playlist: {request.playlist_id}")
    
    try:
        # 1. Initialize User Context
        user_sp = spotipy.Spotify(auth=request.token)
        user_id = user_sp.current_user()['id']
        
        target_playlist_id = request.playlist_id
        
        # Always get track info first
        track_info = user_sp.track(request.track_id)
        track_name = track_info['name']
        artist_name = track_info['artists'][0]['name']

        # 2. Detect Genre (Always run this now for Analytics)
        genre = detect_genre_with_gemini(track_name, artist_name)
        print(f"🤖 Genre: {genre}")
        
        playlist_name = "Stash: " + genre

        # 3. Smart Sort Logic (Playlist overriding)
        if request.playlist_id == "smart_sort":
            print("🧠 Smart Sort Engaged.")
            
            # Find/Create Playlist
            playlists = user_sp.current_user_playlists(limit=50)
            existing_id = None
            for p in playlists['items']:
                if p['name'].lower() == playlist_name.lower():
                    existing_id = p['id']
                    break
            
            if existing_id:
                target_playlist_id = existing_id
                print(f"📂 Found existing playlist: {playlist_name}")
            else:
                new_playlist = user_sp.user_playlist_create(user_id, playlist_name, public=False)
                target_playlist_id = new_playlist['id']
                print(f"✨ Created new playlist: {playlist_name}")

        # 4. Add Track to Target Playlist
        final_playlist_name = "Liked Songs"
        
        if target_playlist_id and target_playlist_id != '1':
             user_sp.playlist_add_items(target_playlist_id, [f"spotify:track:{request.track_id}"])
             
             # If it was Smart Sort, we already have the name
             if request.playlist_id == "smart_sort":
                 final_playlist_name = playlist_name
             else:
                 # Fetch name for custom ID
                 try:
                     pl_details = user_sp.playlist(target_playlist_id)
                     final_playlist_name = pl_details['name']
                 except:
                     final_playlist_name = "Selected Playlist"
                     
             print(f"✅ Added to playlist: {final_playlist_name} ({target_playlist_id})")
        else:
             user_sp.current_user_saved_tracks_add([request.track_id])
             print("✅ Added to Liked Songs")

        return {
            "success": True, 
            "playlist_id": target_playlist_id, 
            "playlist_name": final_playlist_name,
            "genre": genre 
        }

    except Exception as e:
        print(f"❌ Save Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
