from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException

import sqlite3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class NewPost(BaseModel):
    title: str
    body: str
    userId: int

class Post(NewPost):
    id: int 

def init_db():
    conn = sqlite3.connect("posts.db")# SQLite のDBにpost.dbを作成
    cursor = conn.cursor()# DBの操作を行うためのカーソルを作成

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            userId INTEGER NOT NULL
        )
    """)
    conn.commit()# DBを保存する
    conn.close()# DBを閉じる

@app.on_event("startup")
def startup():
    init_db()

@app.get("/posts")
def get_posts():
    conn = sqlite3.connect("posts.db")# SQLite のDBにpost.dbに接続
    cursor = conn.cursor()# DBの操作を行うためのカーソルを作成
    cursor.execute("SELECT id, title, body, userId FROM posts") # postsテーブルからid, title, body, userIdを取得
    rows = cursor.fetchall() # 取得したデータをrowsに格納

    conn.close()# DBを閉じる
    return [
        Post(id=row[0], title=row[1], body=row[2], userId=row[3]) # Postオブジェクトを作成
        for row in rows # rowsの各要素をPostオブジェクトに変換
    ]

@app.post("/posts")
def create_post(new_post: NewPost):
    conn = sqlite3.connect("posts.db")# SQLite のDBにpost.dbに接続
    cursor = conn.cursor()# DBの操作を行うためのカーソルを作成

    cursor.execute(
        "INSERT INTO posts (title, body, userId) VALUES (?, ?, ?)",
        (new_post.title, new_post.body, new_post.userId)
    )# postsテーブルにtitle, body, userIdをINSERT

    post_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return Post(
        id=post_id,
        title=new_post.title,
        body=new_post.body,
        userId=new_post.userId
    )

@app.put("/posts/{post_id}")
def update_post(post_id: int, new_post: NewPost):
    conn = sqlite3.connect("posts.db")# SQLite のDBにpost.dbに接続
    cursor = conn.cursor()# DBの操作を行うためのカーソルを作成

    cursor.execute(
        "UPDATE posts SET title = ?, body = ?, userId = ? WHERE id = ?",
        (new_post.title, new_post.body, new_post.userId, post_id)
    )# postsテーブルのidがpost_idの行をUPDATE

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Post not found")

    conn.commit()
    conn.close()

    return Post(
        id=post_id,
        title=new_post.title,
        body=new_post.body,
        userId=new_post.userId
    )

@app.delete("/posts/{post_id}")
def delete_post(post_id: int):
    conn = sqlite3.connect("posts.db")
    cursor = conn.cursor()

    cursor.execute("DELETE FROM posts WHERE id = ?", (post_id,))

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Post not found")

    conn.commit()
    conn.close()

    return {"message": "Post deleted"}