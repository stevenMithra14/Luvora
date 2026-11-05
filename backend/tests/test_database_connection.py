import os
import sys
import unittest
from datetime import date

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.api.health import health_check
from app.database import (
    SessionLocal,
    check_database_connection,
    get_safe_db_diagnostics,
    sanitize_database_error
)
from app.models.gift import Gift, GiftPhoto, GiftSection, GiftInteractive, GiftGoodie
from app.schemas.gift import (
    GiftCreate,
    GiftUpdate,
    GiftPhotoCreate,
    GiftSectionCreate,
    GiftInteractiveCreate,
    GiftGoodieCreate,
    VerifyPasswordRequest
)
from app.api.gifts import (
    create_published_gift,
    get_public_gift,
    update_gift_by_edit_token,
    verify_public_gift_password,
    get_unlocked_gift_content,
    SAFE_PUBLISH_ERROR_MESSAGE
)

class TestDatabaseConnectionAndPublishing(unittest.TestCase):
    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_safe_db_diagnostics_never_exposes_passwords(self):
        diag = get_safe_db_diagnostics()
        self.assertIn("dialect", diag)
        self.assertIn("host", diag)
        self.assertIn("password_configured", diag)
        self.assertNotIn("password", diag)
        self.assertIsInstance(diag["password_configured"], bool)

    def test_database_connectivity_check(self):
        is_connected, msg, diag = check_database_connection()
        self.assertTrue(is_connected)
        self.assertEqual(msg, "Database connection operational")
        self.assertIsInstance(diag, dict)

    def test_sanitize_database_error_output(self):
        err = Exception("psycopg2.OperationalError: FATAL: (ENOTFOUND) tenant/user postgres.gdiguytiobkopjhlqjsw not found")
        sanitized = sanitize_database_error(err)
        self.assertEqual(sanitized, SAFE_PUBLISH_ERROR_MESSAGE)
        self.assertNotIn("psycopg2", sanitized)
        self.assertNotIn("tenant/user", sanitized)
        self.assertNotIn("gdiguytiobkopjhlqjsw", sanitized)

    def test_health_check_endpoint(self):
        data = health_check()
        self.assertIn("status", data)
        self.assertEqual(data["service"], "Luvora API")
        self.assertIn("database", data)
        self.assertTrue(data["database"]["connected"])

    def test_atomic_transaction_rollback_on_invalid_component(self):
        """Verify that an invalid component in gift creation rolls back completely and does not leave partial records."""
        initial_gift_count = self.db.query(Gift).count()
        initial_photo_count = self.db.query(GiftPhoto).count()

        invalid_gift_in = GiftCreate(
            occasion_type="birthday",
            recipient_name="Alex",
            title="Test Gift",
            photos=[
                GiftPhotoCreate(file_url="https://example.com/pic1.jpg", caption="Pic 1")
            ],
            interactives=[
                GiftInteractiveCreate(
                    interactive_type="completely_invalid_game_type",
                    configuration_json={}
                )
            ]
        )

        with self.assertRaises(Exception):
            create_published_gift(invalid_gift_in, self.db)

        # Confirm rollback: no new gift or photo was persisted
        self.assertEqual(self.db.query(Gift).count(), initial_gift_count)
        self.assertEqual(self.db.query(GiftPhoto).count(), initial_photo_count)

    def test_full_gift_publishing_and_retrieval_workflow(self):
        """Audit complete workflow: Create -> Photos -> Sections -> Interactives -> Goodies -> Publish -> Retrieve."""
        first_met_date = date(2023, 4, 15)
        gift_in = GiftCreate(
            occasion_type="friendship",
            recipient_name="Morgan",
            recipient_date=first_met_date,
            title="To an Unbreakable Bond",
            message="Here's to all our laughs and memories!",
            theme_id="theme-midnight",
            music_url="https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
            is_published=True,
            photos=[
                GiftPhotoCreate(file_url="https://example.com/friend1.jpg", caption="First trip together", display_order=0),
                GiftPhotoCreate(file_url="https://example.com/friend2.jpg", caption="Coffee catchup", display_order=1)
            ],
            sections=[
                GiftSectionCreate(
                    section_type="timeline",
                    title="Our Story",
                    content={"events": ["Met in spring", "Road trip"]},
                    display_order=0
                )
            ],
            interactives=[
                GiftInteractiveCreate(
                    interactive_type="best_friend_quiz",
                    configuration_json={"questions": ["Who is louder?"]},
                    display_order=0
                ),
                GiftInteractiveCreate(
                    interactive_type="cake_box_config",
                    configuration_json={"cakeConfig": None, "giftBoxConfig": {"color": "purple"}},
                    display_order=1
                )
            ],
            goodies=[
                GiftGoodieCreate(
                    goodie_type="note",
                    title="Forever Friends",
                    description="A sweet message for you",
                    content={"body": "You are the best!"},
                    display_order=0
                ),
                GiftGoodieCreate(
                    goodie_type="coupon",
                    title="Free Coffee",
                    description="Redeem anytime",
                    content={"code": "COFFEE100"},
                    display_order=1
                )
            ]
        )

        # 1. Publish gift
        published = create_published_gift(gift_in, self.db)
        self.assertIsNotNone(published.id)
        self.assertIsNotNone(published.public_id)
        self.assertIsNotNone(published.edit_token)
        self.assertEqual(published.occasion_type, "friendship")
        self.assertEqual(published.recipient_date, first_met_date)
        self.assertEqual(len(published.photos), 2)
        self.assertEqual(len(published.sections), 1)
        self.assertEqual(len(published.interactives), 2)
        self.assertEqual(len(published.goodies), 2)

        # 2. Public retrieval
        public_view = get_public_gift(published.public_id, self.db)
        self.assertEqual(public_view.recipient_name, "Morgan")
        self.assertEqual(public_view.recipient_date, first_met_date)
        self.assertEqual(public_view.title, "To an Unbreakable Bond")
        self.assertEqual(len(public_view.photos), 2)
        self.assertEqual(len(public_view.sections), 1)
        self.assertEqual(len(public_view.goodies), 2)
        self.assertFalse(public_view.is_locked)

        # 3. Update gift
        updated = update_gift_by_edit_token(
            published.edit_token,
            GiftUpdate(title="To an Unbreakable Bond (Updated)"),
            self.db
        )
        self.assertEqual(updated.title, "To an Unbreakable Bond (Updated)")

        # Verify public view reflects update
        re_fetched = get_public_gift(published.public_id, self.db)
        self.assertEqual(re_fetched.title, "To an Unbreakable Bond (Updated)")

    def test_password_protected_gift_security(self):
        """Verify that password protected gifts lock content until verified."""
        gift_in = GiftCreate(
            occasion_type="love_letter",
            recipient_name="Charlie",
            title="Secret Love Letter",
            message="Top secret love confession",
            password="SuperSecretPassword123",
            password_hint="Favorite vacation spot",
            password_enabled=True,
            is_published=True,
            photos=[
                GiftPhotoCreate(file_url="https://example.com/secret.jpg", caption="Private")
            ]
        )
        published = create_published_gift(gift_in, self.db)

        # 1. Public view without password must be locked
        locked_view = get_public_gift(published.public_id, self.db)
        self.assertTrue(locked_view.is_locked)
        self.assertEqual(locked_view.title, "Protected Gift")
        self.assertIsNone(locked_view.message)
        self.assertEqual(len(locked_view.photos), 0)

        # 2. Verify password with mock request
        class MockRequest:
            client = type("Client", (), {"host": "127.0.0.1"})()

        verify_res = verify_public_gift_password(
            published.public_id,
            VerifyPasswordRequest(password="SuperSecretPassword123"),
            MockRequest(),
            self.db
        )
        self.assertTrue(verify_res["verified"])
        access_token = verify_res["access_token"]

        # 3. Fetch unlocked content with token
        unlocked_view = get_unlocked_gift_content(published.public_id, access_token, self.db)
        self.assertFalse(unlocked_view.is_locked)
        self.assertEqual(unlocked_view.title, "Secret Love Letter")
        self.assertEqual(unlocked_view.message, "Top secret love confession")
        self.assertEqual(len(unlocked_view.photos), 1)

if __name__ == "__main__":
    unittest.main()
