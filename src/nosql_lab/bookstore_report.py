#!/usr/bin/env python3
"""Print a bookstore inventory report from MongoDB Atlas.

Connects to the `bookstore` database built in Case Study 1 and, for each
author in a list, prints the author's name followed by the title and
publication year of every book whose `author_ids` contains that author.
"""
import logging
import os

from pymongo import MongoClient
from pymongo.errors import PyMongoError
from pymongo.server_api import ServerApi

# Credentials come from the environment (set in ~/.zshrc); never hardcode them
MONGODB_ATLAS_URL = os.getenv("MONGODB_ATLAS_URL")
MONGODB_ATLAS_USER = os.getenv("MONGODB_ATLAS_USER")
MONGODB_ATLAS_PWD = os.getenv("MONGODB_ATLAS_PWD")

# Authors to report on: two from the loaded files, two added in step 7
AUTHOR_IDS = ["author_002", "author_003", "author_004", "author_005"]

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def get_client():
    """Return a MongoClient connected to Atlas, or raise if the connection fails."""
    client = MongoClient(
        MONGODB_ATLAS_URL,
        username=MONGODB_ATLAS_USER,
        password=MONGODB_ATLAS_PWD,
        server_api=ServerApi("1"),  # same API version as mongosh --apiVersion 1
    )
    # MongoClient connects lazily, so ping to confirm the connection works now
    client.admin.command("ping")
    logger.info("Connected to MongoDB Atlas")
    return client


def books_for_author(books, author_id):
    """Return the books whose author_ids list contains author_id."""
    # Matching a scalar against an array field finds any book listing this author
    return list(books.find({"author_ids": author_id}))


def main():
    """Connect to Atlas and print each listed author with their linked books."""
    client = None
    try:
        client = get_client()
        db = client["bookstore"]
        authors = db["authors"]
        books = db["books"]

        # Count how many authors in the list actually exist in the collection
        total = authors.count_documents({"_id": {"$in": AUTHOR_IDS}})
        print(f"Authors: {total}")

        # Loop in list order so the report order is predictable
        for author_id in AUTHOR_IDS:
            author = authors.find_one({"_id": author_id})
            if author is None:
                logger.warning("No author found with _id %s", author_id)
                continue

            print(f"\n{author['name']}")
            # Join: resolve this author's books through author_ids on each book
            for book in books_for_author(books, author["_id"]):
                print(f"  {book['title']} ({book['published_year']})")
    except PyMongoError as e:
        logger.error("MongoDB error: %s", e)
    finally:
        # Always close the client, even after an error
        if client is not None:
            client.close()
            logger.info("Connection closed")


if __name__ == "__main__":
    main()
