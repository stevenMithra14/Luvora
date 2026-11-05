import os
import sys
import unittest
from datetime import date

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal
from app.schemas.gift import GiftCreate, GiftUpdate
from app.api.gifts import (
    create_published_gift,
    get_public_gift,
    update_gift_by_edit_token
)

class TestFriendshipGift(unittest.TestCase):
    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_create_friendship_gift_with_first_met_date(self):
        # 1. Create friendship celebration gift with "when we first met" date
        first_met = date(2021, 9, 14)
        gift_in = GiftCreate(
            occasion_type="friendship",
            recipient_name="Taylor",
            recipient_date=first_met,
            title="Happy Friendship Day!",
            message="Thank you for being my anchor through thick and thin.",
            is_published=True
        )

        created = create_published_gift(gift_in, self.db)
        self.assertIsNotNone(created.id)
        self.assertIsNotNone(created.public_id)
        self.assertEqual(created.occasion_type, "friendship")
        self.assertEqual(created.recipient_name, "Taylor")
        self.assertEqual(created.recipient_date, first_met)

        # 2. Retrieve public gift payload
        public_gift = get_public_gift(created.public_id, self.db)
        self.assertEqual(public_gift.occasion_type, "friendship")
        self.assertEqual(public_gift.recipient_name, "Taylor")
        self.assertEqual(public_gift.recipient_date, first_met)
        self.assertEqual(public_gift.title, "Happy Friendship Day!")

    def test_update_friendship_first_met_date(self):
        # Test editing the first met date via edit_token
        initial_date = date(2020, 2, 29) # Leap year test
        gift_in = GiftCreate(
            occasion_type="friendship",
            recipient_name="Sam",
            recipient_date=initial_date,
            title="Bestie Celebration",
            is_published=True
        )
        created = create_published_gift(gift_in, self.db)

        # Update first met date
        new_date = date(2022, 5, 20)
        updated = update_gift_by_edit_token(
            created.edit_token,
            GiftUpdate(recipient_date=new_date),
            self.db
        )
        self.assertEqual(updated.recipient_date, new_date)

        # Confirm retrieval reflects update
        re_fetched = get_public_gift(created.public_id, self.db)
        self.assertEqual(re_fetched.recipient_date, new_date)

    def test_birthday_occasion_date_isolation(self):
        # Verify Birthday occasion retains standard date behavior
        birth_date = date(1998, 12, 25)
        gift_in = GiftCreate(
            occasion_type="birthday",
            recipient_name="Jordan",
            recipient_date=birth_date,
            title="Happy 28th Birthday!",
            is_published=True
        )
        created = create_published_gift(gift_in, self.db)
        self.assertEqual(created.occasion_type, "birthday")
        self.assertEqual(created.recipient_date, birth_date)

        public_gift = get_public_gift(created.public_id, self.db)
        self.assertEqual(public_gift.occasion_type, "birthday")
        self.assertEqual(public_gift.recipient_date, birth_date)

if __name__ == "__main__":
    unittest.main()
