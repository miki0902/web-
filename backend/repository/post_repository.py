from typing import List, Optional
from models import Post, NewPost
from db import get_connection

def fetch_all() -> List[Post]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, body, userId FROM posts")
    rows = cursor.fetchall()
    conn.close()

    return [
        Post(id=row[0], title=row[1], body=row[2], userId=row[3])
        for row in rows
    ]

def create(new_post: NewPost) -> Post:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO posts (title, body, userId) VALUES (?, ?, ?)",
        (new_post.title, new_post.body, new_post.userId)
    )
    post_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return Post(id=post_id, **new_post.dict())

def update(post_id: int, new_post: NewPost) -> Optional[Post]:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE posts SET title = ?, body = ?, userId = ? WHERE id = ?",
        (new_post.title, new_post.body, new_post.userId, post_id),
    )

    if cursor.rowcount == 0:
        conn.close()
        return None

    conn.commit()
    conn.close()
    return Post(id=post_id, **new_post.dict())

def delete(post_id: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM posts WHERE id = ?", (post_id,))
    deleted = cursor.rowcount > 0 # 削除された行数が1行以上あればTrue
    conn.commit()
    conn.close()
    return deleted

