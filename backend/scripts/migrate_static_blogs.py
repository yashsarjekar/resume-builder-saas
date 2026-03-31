#!/usr/bin/env python3
"""
Phase 1 migration: imports static blogs from static_blogs.json into PostgreSQL.

Run AFTER:
  1. psql $DATABASE_URL -f migrations/add_blog_tables.sql
  2. cd frontend && npx tsx scripts/export-blogs.ts

Then:
  cd backend
  python scripts/migrate_static_blogs.py
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Allow running from repo root or backend/
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

from app.database import SessionLocal
from app.models.blog import BlogPost

BLOGS_JSON = Path(__file__).parent / "static_blogs.json"


def run():
    if not BLOGS_JSON.exists():
        print("❌ static_blogs.json not found.")
        print("   Run first:  cd frontend && npx tsx scripts/export-blogs.ts")
        sys.exit(1)

    with open(BLOGS_JSON) as f:
        blogs = json.load(f)

    print(f"📂 Loaded {len(blogs)} blogs from static_blogs.json")

    db = SessionLocal()
    inserted = 0
    skipped = 0

    try:
        for b in blogs:
            # Skip if slug already exists (idempotent)
            existing = db.query(BlogPost).filter(BlogPost.slug == b["slug"]).first()
            if existing:
                print(f"  ⏭  Skipped (already exists): {b['slug']}")
                skipped += 1
                continue

            # Parse published_at
            try:
                published_at = datetime.strptime(b["published_at"], "%Y-%m-%d")
            except (ValueError, KeyError):
                published_at = datetime.utcnow()

            post = BlogPost(
                slug             = b["slug"],
                title            = b["title"],
                excerpt          = b.get("excerpt"),
                content          = b.get("content"),
                category         = b["category"],
                tags             = b.get("tags", []),
                author           = b.get("author", "Resume Builder Team"),
                read_time        = b.get("read_time", 5),
                featured         = b.get("featured", False),
                status           = "published",
                meta_description = b.get("meta_description"),
                primary_keyword  = b.get("primary_keyword"),
                lsi_keywords     = b.get("lsi_keywords", []),
                word_count       = b.get("word_count", 0),
                published_at     = published_at,
                # Not yet submitted to indexing services
                indexnow_submitted = False,
                google_submitted   = False,
            )
            db.add(post)
            db.flush()  # get id without committing
            print(f"  ✅ Inserted: {b['slug']} (id={post.id})")
            inserted += 1

        db.commit()
        print(f"\n🎉 Done — {inserted} inserted, {skipped} skipped.")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
