"""add email verification fields

Revision ID: add_verification
Revises: 
Create Date: 2026-01-09

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_verification'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add verification columns to users table
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('verification_code', sa.String(), nullable=True))
    op.add_column('users', sa.Column('code_expires_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('verification_attempts', sa.Integer(), nullable=False, server_default='0'))


def downgrade():
    # Remove verification columns
    op.drop_column('users', 'verification_attempts')
    op.drop_column('users', 'code_expires_at')
    op.drop_column('users', 'verification_code')
    op.drop_column('users', 'is_verified')
