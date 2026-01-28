import datetime
from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base
from datetime import datetime

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    body = Column(String, index=True)
    userId = Column(Integer, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)#属性追加日時を記録
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=func.now()) #属性更新日時を記録
    """
    alembic revision --autogenerate -m "add created_at to posts"
    alembic upgrade head でデータベースに反映される。
    """