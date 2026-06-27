import sqlite3
import feedparser
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from database import initialize_database
from clustering import create_clusters, build_clusters

# Initialize the database
initialize_database()

# Connect to SQLite database
conn = sqlite3.connect("news_pulse.db")
cursor = conn.cursor()




# RSS Feeds
feeds = [
    ("BBC", "http://feeds.bbci.co.uk/news/rss.xml"),
    ("NPR", "https://feeds.npr.org/1001/rss.xml")
]

count = 0

# Fetch articles
for source, feed_url in feeds:
    print(f"Fetching from {source}...")

    feed = feedparser.parse(feed_url)

    for article in feed.entries[:10]:

        title = getattr(article, "title", "")
        url = getattr(article, "link", "")
        published = getattr(article, "published", "")
        summary = getattr(article, "summary", "")

        try:
            cursor.execute("""
            INSERT OR IGNORE INTO articles
            (title, source, url, published, summary)
            VALUES (?, ?, ?, ?, ?)
            """, (
                title,
                source,
                url,
                published,
                summary
            ))

            if cursor.rowcount > 0:
                count += 1

        except Exception as e:
            print("Error:", e)

# Save changes
conn.commit()

print(f"\nInserted {count} articles.\n")

# Display statistics
rows = cursor.execute("""
SELECT source, COUNT(*)
FROM articles
GROUP BY source
""").fetchall()

print("Articles by Source:\n")

for row in rows:
    print(f"{row[0]}: {row[1]}")

# Show sample articles
print("\nLatest Articles:\n")

articles = cursor.execute("""
SELECT title, source
FROM articles
ORDER BY id DESC
LIMIT 5
""").fetchall()

for title, source in articles:
    print(f"[{source}] {title}")

create_clusters(cursor)
build_clusters(cursor)
conn.close()
