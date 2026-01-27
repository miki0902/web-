from sqlalchemy.orm import Session
from models.post import Post
from schemas.post import NewPost

def fetch_all(db: Session):
    return db.query(Post).all()

def create(db: Session, new_post: NewPost):
    post = Post(
        title=new_post.title,
        body=new_post.body,
        userId=new_post.userId,
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    return post

def update(db: Session, post_id: int, new_post: NewPost):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
    post.title = new_post.title
    post.body = new_post.body
    post.userId = new_post.userId
    db.commit()
    db.refresh(post)
    return post

def delete(db: Session, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return False
    db.delete(post)
    db.commit()
    return True
