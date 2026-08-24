"""Initial Luvora Database Schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-20 11:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Gift Themes
    op.create_table(
        'gift_themes',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('configuration_json', sa.JSON(), nullable=False),
        sa.Column('preview_image', sa.String(length=512), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.PrimaryKeyConstraint('id')
    )

    # 2. Gifts
    op.create_table(
        'gifts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('public_id', sa.String(length=36), nullable=False),
        sa.Column('edit_token', sa.String(length=64), nullable=False),
        sa.Column('occasion_type', sa.String(length=50), nullable=False),
        sa.Column('recipient_name', sa.String(length=255), nullable=False),
        sa.Column('recipient_date', sa.Date(), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('theme_id', sa.String(length=36), nullable=True),
        sa.Column('music_url', sa.String(length=512), nullable=True),
        sa.Column('password_hash', sa.String(length=255), nullable=True),
        sa.Column('password_enabled', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('is_published', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['theme_id'], ['gift_themes.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_gifts_public_id'), 'gifts', ['public_id'], unique=True)
    op.create_index(op.f('ix_gifts_edit_token'), 'gifts', ['edit_token'], unique=True)

    # 3. Gift Photos
    op.create_table(
        'gift_photos',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('gift_id', sa.String(length=36), nullable=False),
        sa.Column('file_url', sa.String(length=512), nullable=False),
        sa.Column('caption', sa.Text(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['gift_id'], ['gifts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_gift_photos_gift_id'), 'gift_photos', ['gift_id'], unique=False)

    # 4. Gift Sections
    op.create_table(
        'gift_sections',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('gift_id', sa.String(length=36), nullable=False),
        sa.Column('section_type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('content', sa.JSON(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_enabled', sa.Boolean(), nullable=False, server_default='1'),
        sa.ForeignKeyConstraint(['gift_id'], ['gifts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_gift_sections_gift_id'), 'gift_sections', ['gift_id'], unique=False)

    # 5. Gift Interactives
    op.create_table(
        'gift_interactives',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('gift_id', sa.String(length=36), nullable=False),
        sa.Column('interactive_type', sa.String(length=50), nullable=False),
        sa.Column('configuration_json', sa.JSON(), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_enabled', sa.Boolean(), nullable=False, server_default='1'),
        sa.ForeignKeyConstraint(['gift_id'], ['gifts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_gift_interactives_gift_id'), 'gift_interactives', ['gift_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_gift_interactives_gift_id'), table_name='gift_interactives')
    op.drop_table('gift_interactives')

    op.drop_index(op.f('ix_gift_sections_gift_id'), table_name='gift_sections')
    op.drop_table('gift_sections')

    op.drop_index(op.f('ix_gift_photos_gift_id'), table_name='gift_photos')
    op.drop_table('gift_photos')

    op.drop_index(op.f('ix_gifts_edit_token'), table_name='gifts')
    op.drop_index(op.f('ix_gifts_public_id'), table_name='gifts')
    op.drop_table('gifts')

    op.drop_table('gift_themes')
