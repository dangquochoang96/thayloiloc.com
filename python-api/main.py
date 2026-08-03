import os
import shutil
import tempfile
from typing import List, Optional
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from dotenv import load_dotenv

# YouTube imports
import google_auth_oauthlib.flow
import googleapiclient.discovery
import googleapiclient.errors
from googleapiclient.http import MediaFileUpload

load_dotenv()

app = FastAPI(title="Social Post API")

# Allow CORS so frontend can call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FB_PAGE_ID = os.getenv("FB_PAGE_ID", "")
FB_PAGE_ACCESS_TOKEN = os.getenv("FB_PAGE_ACCESS_TOKEN", "")
IG_USER_ID = os.getenv("IG_USER_ID", "")


def post_to_facebook(content: str, image_paths: List[str]):
    """Đăng bài lên Facebook Page (Hỗ trợ text và hình ảnh)"""
    if not FB_PAGE_ID or not FB_PAGE_ACCESS_TOKEN:
        return {"error": "Missing FB credentials"}

    results = []
    # FB Graph API version
    url = f"https://graph.facebook.com/v19.0/{FB_PAGE_ID}"

    if len(image_paths) == 0:
        # Post text only
        resp = requests.post(f"{url}/feed", data={
            "message": content,
            "access_token": FB_PAGE_ACCESS_TOKEN
        })
        results.append(resp.json())
    else:
        # Upload multiple images (If multiple, ideally we upload to /photos as unpublished, then attach to a feed post, 
        # but for simplicity we'll just upload the photos with the caption on the first one)
        for i, img_path in enumerate(image_paths):
            caption = content if i == 0 else "" # Only add content to first image to avoid spamming
            with open(img_path, 'rb') as img:
                resp = requests.post(f"{url}/photos", data={
                    "message": caption,
                    "access_token": FB_PAGE_ACCESS_TOKEN
                }, files={
                    "source": img
                })
            results.append(resp.json())
            
    return results


def post_to_instagram(content: str, image_paths: List[str]):
    """Đăng bài lên Instagram (Bắt buộc phải có ÍT NHẤT 1 hình ảnh)"""
    if not IG_USER_ID or not FB_PAGE_ACCESS_TOKEN:
        return {"error": "Missing IG credentials"}
        
    if len(image_paths) == 0:
        return {"error": "Instagram requires an image"}

    # NOTE: Instagram Graph API requires the image to be hosted on a PUBLIC URL.
    # Since this is local, we cannot send a local file directly.
    # In a real app, you would upload the file to your PHP server first, get the URL, and pass the URL here.
    # For now, we return a warning.
    return {"error": "Instagram Graph API requires a public Image URL, local file uploads acting as URLs are not supported directly."}


def post_to_youtube(content: str, video_paths: List[str]):
    """Đăng video lên YouTube"""
    # This requires client_secrets.json to be present in the directory
    if len(video_paths) == 0:
        return {"error": "YouTube requires a video"}

    client_secrets_file = "client_secrets.json"
    if not os.path.exists(client_secrets_file):
        return {"error": "Missing client_secrets.json for YouTube OAuth"}

    results = []
    scopes = ["https://www.googleapis.com/auth/youtube.upload"]
    
    try:
        # Get credentials and create an API client
        # In a real headless server, you'd use a service account or pre-authorized token
        flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_secrets_file(
            client_secrets_file, scopes)
        credentials = flow.run_local_server(port=0)
        youtube = googleapiclient.discovery.build(
            "youtube", "v3", credentials=credentials)

        for video_path in video_paths:
            request = youtube.videos().insert(
                part="snippet,status",
                body={
                  "snippet": {
                    "categoryId": "22",
                    "description": content,
                    "title": content[:100] if content else "Video Hỏi Đáp"  # YouTube requires a title
                  },
                  "status": {
                    "privacyStatus": "public"
                  }
                },
                media_body=MediaFileUpload(video_path)
            )
            response = request.execute()
            results.append(response)
            
    except Exception as e:
        return {"error": str(e)}

    return results


@app.post("/publish")
async def publish_social(
    content: str = Form(""),
    platforms: str = Form(""),  # comma separated e.g. "facebook,youtube"
    images: List[UploadFile] = File(default=[]),
    videos: List[UploadFile] = File(default=[])
):
    platforms_list = [p.strip().lower() for p in platforms.split(",") if p.strip()]
    if not platforms_list:
        return {"success": True, "message": "No platforms selected"}

    # Save files temporarily
    temp_dir = tempfile.mkdtemp()
    saved_images = []
    saved_videos = []

    try:
        # Iterate over all images regardless of content (since images[0] might be an empty file if left blank in form)
        for img in images:
            if img.filename and img.size > 0:
                file_path = os.path.join(temp_dir, img.filename)
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(img.file, buffer)
                saved_images.append(file_path)

        for vid in videos:
            if vid.filename and vid.size > 0:
                file_path = os.path.join(temp_dir, vid.filename)
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(vid.file, buffer)
                saved_videos.append(file_path)

        results = {}

        if "facebook" in platforms_list:
            results["facebook"] = post_to_facebook(content, saved_images)
            
        if "instagram" in platforms_list:
            results["instagram"] = post_to_instagram(content, saved_images)
            
        if "youtube" in platforms_list:
            results["youtube"] = post_to_youtube(content, saved_videos)

        return {"success": True, "results": results}

    finally:
        # Clean up temporary files
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
