from pydantic import BaseModel, ConfigDict

class NewPost(BaseModel):
    title: str
    body: str
    userId: int

class Post(NewPost):
    id: int

    model_config = ConfigDict(from_attributes=True)  # Pydantic v2: orm_mode -> from_attributes