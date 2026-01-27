from schemas.post import NewPost
from repository import post_repository

def get_posts(db):
    return post_repository.fetch_all(db)

def create_post(db,new_post: NewPost):
    return post_repository.create(db, new_post)

def update_post(db, post_id: int, new_post: NewPost):
    post = post_repository.update(db, post_id, new_post)
    if post is None:
        raise ValueError("Post not found")
    return post

def delete_post(db, post_id: int):
    if not post_repository.delete(db, post_id):
        raise ValueError("Post not found")

        