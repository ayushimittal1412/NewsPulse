from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def create_clusters(cursor):
    rows = cursor.execute("""
    SELECT id, title, summary
    FROM articles
    """).fetchall()

    if len(rows) < 2:
        return

    texts = []

    for row in rows:
        title = row[1] or ""
        summary = row[2] or ""
        texts.append(title + " " + summary)

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf = vectorizer.fit_transform(texts)

    similarity = cosine_similarity(tfidf)

    print("\nSimilarity Matrix Shape:")
    print(similarity.shape)


def build_clusters(cursor):

    cursor.execute("DELETE FROM clusters")
    cursor.execute("UPDATE articles SET cluster_id=NULL")

    rows = cursor.execute("""
    SELECT id, title, summary
    FROM articles
    """).fetchall()

    if len(rows) < 2:
        return

    texts = [
        (row[1] or "") + " " + (row[2] or "")
        for row in rows
    ]

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf = vectorizer.fit_transform(texts)

    similarity = cosine_similarity(tfidf)

    visited = set()
    clusters = []

    THRESHOLD = 0.20

    for i in range(len(rows)):

        if i in visited:
            continue

        cluster = [i]
        visited.add(i)

        for j in range(i + 1, len(rows)):

            if similarity[i][j] >= THRESHOLD:
                cluster.append(j)
                visited.add(j)

        clusters.append(cluster)

    print("\nClusters Found:\n")

    for idx, cluster in enumerate(clusters, start=1):

        label = rows[cluster[0]][1][:50]
        heat_score = len(cluster)

        cursor.execute("""
        INSERT INTO clusters(label, article_count, heat_score)
        VALUES (?, ?, ?)
        """, (
            label,
            len(cluster),
            heat_score
        ))

        cluster_db_id = cursor.lastrowid

        for article_index in cluster:

            article_id = rows[article_index][0]

            cursor.execute("""
            UPDATE articles
            SET cluster_id=?
            WHERE id=?
            """, (
                cluster_db_id,
                article_id
            ))

    cursor.connection.commit()

    print(f"Created {len(clusters)} clusters.")