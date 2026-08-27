import os
import time
import base64
import json
import urllib.request
import urllib.parse
from typing import Optional
from fastapi import APIRouter, Query, status

router = APIRouter()

_token_cache = {"access_token": None, "expires_at": 0}

def get_spotify_access_token() -> Optional[str]:
    global _token_cache
    client_id = os.getenv("SPOTIFY_CLIENT_ID", "").strip()
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET", "").strip()

    if not client_id or not client_secret:
        return None

    now = time.time()
    if _token_cache["access_token"] and _token_cache["expires_at"] > now + 60:
        return _token_cache["access_token"]

    try:
        url = "https://accounts.spotify.com/api/token"
        credentials = f"{client_id}:{client_secret}"
        encoded_creds = base64.b64encode(credentials.encode("utf-8")).decode("utf-8")
        headers = {
            "Authorization": f"Basic {encoded_creds}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = urllib.parse.urlencode({"grant_type": "client_credentials"}).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")

        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            access_token = body.get("access_token")
            expires_in = body.get("expires_in", 3600)
            if access_token:
                _token_cache["access_token"] = access_token
                _token_cache["expires_at"] = now + expires_in
                return access_token
    except Exception as err:
        print(f"Error authenticating with Spotify API: {err}")
    return None

def format_duration(ms: int) -> str:
    if not ms or ms <= 0:
        return "0:00"
    seconds = int(ms / 1000)
    mins = seconds // 60
    secs = seconds % 60
    return f"{mins}:{secs:02d}"

@router.get("/spotify/search")
def search_spotify(
    q: str = Query(..., description="Search query string"),
    type: str = Query("track", description="Search item type: track, artist, album"),
    limit: int = Query(20, ge=1, le=50, description="Result limit")
):
    """
    Search Spotify Web API for tracks, artists, and albums.
    Securely authenticates using backend Client Credentials flow.
    """
    query_str = q.strip()
    if not query_str:
        return {"status": "success", "tracks": [], "artists": [], "albums": []}

    client_id = os.getenv("SPOTIFY_CLIENT_ID", "").strip()
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET", "").strip()

    if not client_id or not client_secret:
        return {
            "status": "unconfigured",
            "message": "Spotify API credentials (SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET) are not configured on the backend server. You can upload custom music or configure Spotify keys in backend .env.",
            "tracks": [],
            "artists": [],
            "albums": []
        }

    token = get_spotify_access_token()
    if not token:
        return {
            "status": "error",
            "message": "Music search is temporarily unavailable (auth failed). Please try again or upload your own music.",
            "tracks": [],
            "artists": [],
            "albums": []
        }

    try:
        spotify_type = "track,artist,album" if type not in ("track", "artist", "album") else type
        params = urllib.parse.urlencode({
            "q": query_str,
            "type": spotify_type,
            "limit": limit
        })
        url = f"https://api.spotify.com/v1/search?{params}"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})

        with urllib.request.urlopen(req, timeout=10) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))

            # Process Tracks
            tracks = []
            track_items = res_data.get("tracks", {}).get("items", [])
            for item in track_items:
                album = item.get("album", {})
                images = album.get("images", [])
                album_art = images[0]["url"] if images else ""
                artists = [a.get("name") for a in item.get("artists", []) if a.get("name")]
                artist_name = ", ".join(artists) if artists else "Unknown Artist"

                tracks.append({
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "artist": artist_name,
                    "artists": artists,
                    "album": album.get("name", ""),
                    "albumArt": album_art,
                    "durationMs": item.get("duration_ms", 0),
                    "durationFormatted": format_duration(item.get("duration_ms", 0)),
                    "previewUrl": item.get("preview_url"),
                    "spotifyUrl": item.get("external_urls", {}).get("spotify"),
                    "uri": item.get("uri")
                })

            # Process Artists
            artists_list = []
            artist_items = res_data.get("artists", {}).get("items", [])
            for a_item in artist_items:
                imgs = a_item.get("images", [])
                artists_list.append({
                    "id": a_item.get("id"),
                    "name": a_item.get("name"),
                    "image": imgs[0]["url"] if imgs else "",
                    "followers": a_item.get("followers", {}).get("total", 0),
                    "spotifyUrl": a_item.get("external_urls", {}).get("spotify")
                })

            # Process Albums
            albums_list = []
            album_items = res_data.get("albums", {}).get("items", [])
            for al_item in album_items:
                imgs = al_item.get("images", [])
                al_artists = [a.get("name") for a in al_item.get("artists", []) if a.get("name")]
                albums_list.append({
                    "id": al_item.get("id"),
                    "name": al_item.get("name"),
                    "artist": ", ".join(al_artists) if al_artists else "Unknown Artist",
                    "albumArt": imgs[0]["url"] if imgs else "",
                    "releaseDate": al_item.get("release_date", ""),
                    "spotifyUrl": al_item.get("external_urls", {}).get("spotify")
                })

            return {
                "status": "success",
                "tracks": tracks,
                "artists": artists_list,
                "albums": albums_list
            }

    except Exception as err:
        print(f"Error calling Spotify Search API: {err}")
        return {
            "status": "error",
            "message": "Music search is temporarily unavailable. Please try again or upload custom music.",
            "tracks": [],
            "artists": [],
            "albums": []
        }
