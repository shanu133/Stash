import os
import time
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
    allow_origins=["*"],  # Adjust this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReelRequest(BaseModel):
    url: str

@app.get("/")
def health_check():
    return {"status": "Antigravity Engine Online 🟢"}

@app.post("/recognize")
def recognize_reel(request: ReelRequest):
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
                spotify_result = search_spotify(track, artist)
                if spotify_result:
                    return spotify_result
    except Exception as e:
        print(f"⚠️ Metadata extraction skipped: {e}")

    # --- STEP 2: AI LISTENING (The Smart Path) ---
    print("👂 Metadata failed. Switching to AI Listening...")
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
        final_result = search_spotify(ai_data.get('track'), ai_data.get('artist'))
        
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
        print(f"❌ AI Error: {e}")
        # Cleanup on error
        if os.path.exists(audio_filename):
            os.remove(audio_filename)
        raise HTTPException(status_code=500, detail=str(e))

def download_audio(url):
    """Downloads Instagram audio to a temporary mp3 file"""
    try:
        filename = f"temp_{int(time.time())}"
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': filename,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '128',
            }],
            'quiet': True,
            'no_warnings': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        # Find the file (yt-dlp adds extensions)
        files = glob.glob(f"{filename}*")
        return files[0] if files else None
    except Exception as e:
        print(f"Download Error: {e}")
        return None

def search_spotify(track, artist):
    """Searches Spotify for the official track"""
    if not track or not artist: return None
    
    query = f"track:{track} artist:{artist}"
    results = sp.search(q=query, type='track', limit=1)
    items = results['tracks']['items']
    
    if items:
        song = items[0]
        return {
            "success": True,
            "track": song['name'],
            "artist": song['artists'][0]['name'],
            "spotify_uri": song['uri'],
            "spotify_url": song['external_urls']['spotify'],
            "album_art": song['album']['images'][0]['url'],
            "confidence": 0.95
        }
    return None

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
