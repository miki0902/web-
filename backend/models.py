from pydantic import BaseModel

class NewPost(BaseModel):
    title: str
    body: str
    userId: int

class Post(NewPost):
    id: int