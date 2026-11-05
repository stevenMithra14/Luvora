import os
import io
import sys
import unittest

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal
from app.models.gift import Gift, GiftPhoto, GiftGoodie, GiftInteractive
from app.schemas.gift import GiftCreate, GiftUpdate, GiftPhotoCreate, GiftGoodieCreate, GiftInteractiveCreate
from app.api.gifts import create_published_gift, get_public_gift, update_gift_by_edit_token
from app.services.storage import get_storage_provider, LocalStorageProvider, SupabaseStorageProvider


class TestMediaStoragePersistence(unittest.TestCase):
    def setUp(self):
        self.db = SessionLocal()
        self.storage = get_storage_provider()

    def tearDown(self):
        self.db.rollback()
        self.db.close()

    def test_local_storage_provider_save_and_verify(self):
        """Test local storage save, URL generation and file verification."""
        local = LocalStorageProvider(upload_dir="uploads")
        dummy_data = io.BytesIO(b"dummy image data for testing")
        filename = "test_image.jpg"
        saved_name = local.save_file(dummy_data, filename, "image/jpeg")
        
        self.assertTrue(saved_name.endswith(".jpg"))
        self.assertTrue(local.verify_file_exists(saved_name))
        url = local.get_file_url(saved_name)
        self.assertIn("/uploads/", url)
        self.assertNotIn("blob:", url)
        self.assertNotIn("data:", url)
        
        # Clean up
        local.delete_file(saved_name)

    def test_supabase_storage_provider_url_and_path_resolution(self):
        """Test Supabase storage public URL formatting and path sanitization."""
        provider = SupabaseStorageProvider()
        provider.supabase_url = "https://gdiguytiobkopjhlqjsw.supabase.co"
        provider.bucket = "luvora-media"

        # 1. Clean relative path
        url1 = provider.get_file_url("gifts/sample_photo.jpg")
        self.assertEqual(
            url1,
            "https://gdiguytiobkopjhlqjsw.supabase.co/storage/v1/object/public/luvora-media/gifts/sample_photo.jpg"
        )

        # 2. Path prefixed with bucket name
        url2 = provider.get_file_url("luvora-media/gifts/sample_photo.jpg")
        self.assertEqual(
            url2,
            "https://gdiguytiobkopjhlqjsw.supabase.co/storage/v1/object/public/luvora-media/gifts/sample_photo.jpg"
        )

        # 3. Leading slash path
        url3 = provider.get_file_url("/luvora-media/gifts/sample_photo.jpg")
        self.assertEqual(
            url3,
            "https://gdiguytiobkopjhlqjsw.supabase.co/storage/v1/object/public/luvora-media/gifts/sample_photo.jpg"
        )

        # 4. Direct HTTPS URL remains untouched
        direct_url = "https://cdn.example.com/audio.mp3"
        self.assertEqual(provider.get_file_url(direct_url), direct_url)

    def test_publish_and_retrieve_gift_with_media_persistence(self):
        """Audit complete media persistence across gift publishing and public retrieval."""
        test_photo_url = "https://gdiguytiobkopjhlqjsw.supabase.co/storage/v1/object/public/luvora-media/gifts/mem1.jpg"
        test_voice_url = "https://gdiguytiobkopjhlqjsw.supabase.co/storage/v1/object/public/luvora-media/gifts/voice1.webm"

        payload = GiftCreate(
            occasion_type="love_letter",
            recipient_name="Taylor",
            title="Persistent Media Gift",
            message="Testing permanent storage",
            is_published=True,
            photos=[
                GiftPhotoCreate(file_url=test_photo_url, caption="Forever Us", display_order=0)
            ],
            sections=[],
            interactives=[
                GiftInteractiveCreate(
                    interactive_type="photo_memories",
                    configuration_json={
                        "memories": [
                            {
                                "id": "mem-1",
                                "type": "photo",
                                "fileUrl": test_photo_url,
                                "title": "Memory Title",
                                "caption": "Memory Caption"
                            }
                        ]
                    },
                    display_order=0,
                    is_enabled=True
                )
            ],
            goodies=[
                GiftGoodieCreate(
                    goodie_type="voice",
                    title="Voice Note",
                    description="Sweet words",
                    media_url=test_voice_url,
                    configuration_json={"audioUrl": test_voice_url},
                    display_order=0,
                    is_enabled=True
                )
            ]
        )

        # 1. Publish gift
        published = create_published_gift(payload, self.db)
        self.assertIsNotNone(published.id)
        self.assertIsNotNone(published.public_id)

        # 2. Retrieve public gift
        pub_gift = get_public_gift(published.public_id, self.db)

        # Verify persistent photo URL
        self.assertEqual(len(pub_gift.photos), 1)
        self.assertEqual(pub_gift.photos[0].file_url, test_photo_url)
        self.assertNotIn("blob:", pub_gift.photos[0].file_url)

        # Verify persistent voice goodie media URL
        self.assertEqual(len(pub_gift.goodies), 1)
        self.assertEqual(pub_gift.goodies[0].media_url, test_voice_url)
        self.assertNotIn("blob:", pub_gift.goodies[0].media_url)

    def test_theme_switch_and_update_never_deletes_media(self):
        """Verify that updating themes or saving without resending media arrays never wipes existing media."""
        test_photo_url = "https://gdiguytiobkopjhlqjsw.supabase.co/storage/v1/object/public/luvora-media/gifts/mem2.jpg"
        test_voice_url = "https://gdiguytiobkopjhlqjsw.supabase.co/storage/v1/object/public/luvora-media/gifts/voice2.webm"

        # 1. Create gift with photos and goodies
        initial_payload = GiftCreate(
            occasion_type="birthday",
            recipient_name="Sam",
            title="Birthday Gift",
            message="Happy Birthday!",
            theme_id="theme-romantic",
            is_published=True,
            photos=[
                GiftPhotoCreate(file_url=test_photo_url, caption="Photo 1", display_order=0)
            ],
            sections=[],
            interactives=[
                GiftInteractiveCreate(
                    interactive_type="photo_memories",
                    configuration_json={"memories": [{"fileUrl": test_photo_url}]},
                    display_order=0
                )
            ],
            goodies=[
                GiftGoodieCreate(
                    goodie_type="voice",
                    title="Voice Greeting",
                    media_url=test_voice_url,
                    configuration_json={"audioUrl": test_voice_url},
                    display_order=0
                )
            ]
        )

        created = create_published_gift(initial_payload, self.db)
        edit_token = created.edit_token

        # 2. Simulate theme switching multiple times and saving
        # Notice: client only updates theme_id, and sends empty photos/goodies
        theme_update = GiftUpdate(
            theme_id="theme-midnight",
            photos=[],    # Theme change does not re-upload photos
            goodies=[]    # Theme change does not re-upload goodies
        )

        updated = update_gift_by_edit_token(edit_token, theme_update, self.db)
        self.assertEqual(updated.theme_id, "theme-midnight")

        # CRITICAL ASSERTIONS: existing photos and goodies MUST be preserved!
        self.assertEqual(len(updated.photos), 1)
        self.assertEqual(updated.photos[0].file_url, test_photo_url)
        self.assertEqual(len(updated.goodies), 1)
        self.assertEqual(updated.goodies[0].media_url, test_voice_url)


if __name__ == "__main__":
    unittest.main()
