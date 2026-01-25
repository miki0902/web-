from typing import List
from models import Post, NewPost
from repository import post_repository

def get_posts() -> List[Post]:
    return post_repository.fetch_all()

def create_post(new_post: NewPost) -> Post:
    return post_repository.create(new_post)

def update_post(post_id: int, new_post: NewPost) -> Post:
    post = post_repository.update(post_id, new_post)
    if post is None:
        raise ValueError("Post not found")
    return post

def delete_post(post_id: int) -> bool:
    if not post_repository.delete(post_id):
        raise ValueError("Post not found")

        