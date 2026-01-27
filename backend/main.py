from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from deps import get_db
from schemas.post import Post, NewPost
from service import post_service



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
    Base.metadata.create_all(bind=engine)

@app.get("/posts", response_model=list[Post])
def get_posts(db=Depends(get_db)):
    return post_service.get_posts(db)

@app.post("/posts", response_model=Post)
def create_post(new_post: NewPost, db=Depends(get_db)):
    return post_service.create_post(db, new_post)

@app.put("/posts/{post_id}", response_model=Post)
def update_post(post_id: int, new_post: NewPost, db=Depends(get_db)):
    try:
        return post_service.update_post(db, post_id, new_post)
    except ValueError:
        raise HTTPException(status_code=404, detail="Post not found")

@app.delete("/posts/{post_id}")
def delete_post(post_id: int, db=Depends(get_db)):
    try:
        post_service.delete_post(db, post_id)
        return {"message": "Post deleted successfully"}
    except ValueError:
        raise HTTPException(status_code=404, detail="Post not found")


