FROM python:3.11-slim

# Install git and system libraries (needed for some pip packages)
RUN apt-get update && apt-get install -y git ffmpeg

# Setup app
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Railway automatically sets the PORT env var, but we default to 8080
ENV PORT=8080

# Run command using the shell variable
CMD uvicorn main:app --host 0.0.0.0 --port $PORT