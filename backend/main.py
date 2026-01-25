from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Post, NewPost
from service import post_service
from db import init_db


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

@app.get("/posts", response_model=list[Post])
def get_posts():
    return post_service.get_posts()

@app.post("/posts", response_model=Post)
def create_post(new_post: NewPost):
    return post_service.create_post(new_post)

@app.put("/posts/{post_id}", response_model=Post)
def update_post(post_id: int, new_post: NewPost):
    try:
        return post_service.update_post(post_id, new_post)
    except ValueError:
        raise HTTPException(status_code=404, detail="Post not found")

@app.delete("/posts/{post_id}")
def delete_post(post_id: int):
    try:
        post_service.delete_post(post_id)
        return {"message": "Post deleted successfully"}
    except ValueError:
        raise HTTPException(status_code=404, detail="Post not found")


