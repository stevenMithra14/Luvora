import os
import io
import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.storage import get_storage_provider, LocalStorageProvider, SupabaseStorageProvider

class TestMediaStoragePersistence(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.storage = get_storage_provider()

    def test_local_storage_provider_save_and_verify(self):
        dummy_data = io.BytesIO(b"dummy image data for testing")
        filename = "test_image.jpg"
        saved_name = self.storage.save_file(dummy_data, filename, "image/jpeg")
        
        self.assertTrue(saved_name.endswith(".jpg"))
        self.assertTrue(self.storage.verify_file_exists(saved_name))
        url = self.storage.get_file_url(saved_name)
        self.assertIn("/uploads/", url)

    def test_upload_photo_endpoint(self):
        file_bytes = b"fake photo content binary"
        response = self.client.post(
            "/api/upload/photo",
            files={"file": ("test_photo.png", file_bytes, "image/png")}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("url", data)
        self.assertIn("path", data)
        self.assertNotIn("blob:", data["url"])
        self.assertNotIn("data:image", data["url"])

    def test_upload_audio_endpoint(self):
        file_bytes = b"fake audio content binary"
        response = self.client.post(
            "/api/upload/audio",
            files={"file": ("test_voice.mp3", file_bytes, "audio/mpeg")}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("url", data)
        self.assertNotIn("blob:", data["url"])

    def test_upload_video_endpoint(self):
        file_bytes = b"fake video content binary"
        response = self.client.post(
            "/api/upload/video",
            files={"file": ("test_memory_video.mp4", file_bytes, "video/mp4")}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("url", data)
        self.assertNotIn("blob:", data["url"])

    def test_publish_and_retrieve_gift_with_media(self):
        # 1. Upload photo
        photo_res = self.client.post(
            "/api/upload/photo",
            files={"file": ("memory_photo.jpg", b"photo_bytes", "image/jpeg")}
        ).json()
        photo_url = photo_res["url"]

        # 2. Upload voice goodie
        audio_res = self.client.post(
            "/api/upload/audio",
            files={"file": ("voice_note.mp3", b"audio_bytes", "audio/mpeg")}
        ).json()
        voice_url = audio_res["url"]

        # 3. Create gift payload with memories and goodies
        payload = {
            "occasion_type": "love_letter",
            "recipient_name": "Test Recipient",
            "title": "Persistent Media Gift",
            "message": "Testing real media persistence",
            "is_published": True,
            "photos": [
                {"file_url": photo_url, "caption": "Test Photo Caption", "display_order": 0}
            ],
            "sections": [],
            "interactives": [
                {
                    "interactive_type": "photo_memories",
                    "configuration_json": {
                        "memories": [
                            {
                                "id": "mem-1",
                                "type": "photo",
                                "fileUrl": photo_url,
                                "title": "Memory Title",
                                "caption": "Memory Caption"
                            }
                        ]
                    },
                    "display_order": 0,
                    "is_enabled": True
                }
            ],
            "goodies": [
                {
                    "goodie_type": "voice",
                    "title": "Voice Message Goodie",
                    "description": "Voice Note",
                    "media_url": voice_url,
                    "configuration_json": {
                        "audioUrl": voice_url,
                        "title": "Voice Note"
                    },
                    "display_order": 0,
                    "is_enabled": True
                }
            ]
        }

        create_res = self.client.post("/api/gifts", json=payload)
        self.assertEqual(create_res.status_code, 201)
        created_gift = create_res.json()
        public_id = created_gift["public_id"]

        # 4. Retrieve public gift
        pub_res = self.client.get(f"/api/gifts/public/{public_id}")
        self.assertEqual(pub_res.status_code, 200)
        pub_gift = pub_res.json()

        # Verify persistent photo URL
        self.assertEqual(len(pub_gift["photos"]), 1)
        self.assertEqual(pub_gift["photos"][0]["file_url"], photo_url)

        # Verify persistent goodie media URL
        self.assertEqual(len(pub_gift["goodies"]), 1)
        self.assertEqual(pub_gift["goodies"][0]["media_url"], voice_url)
        self.assertNotIn("blob:", pub_gift["goodies"][0]["media_url"])

if __name__ == "__main__":
    unittest.main()
