"""
Business logic for idea management (CRUD operations)
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.models import Idea, User
from app.schemas import IdeaCreate, IdeaUpdate, IdeaResponse


class IdeaService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_idea(self, user_id: UUID, idea_data: IdeaCreate) -> IdeaResponse:
        """Create a new idea"""
        db_idea = Idea(
            user_id=user_id,
            title=idea_data.title,
            problem=idea_data.problem,
            solution=idea_data.solution,
            target_market=idea_data.target_market,
            status="draft"
        )
        
        self.db.add(db_idea)
        self.db.commit()
        self.db.refresh(db_idea)
        
        return IdeaResponse.model_validate(db_idea)
    
    def get_idea_by_id(self, idea_id: int, user_id: UUID) -> Optional[Idea]:
        """Get idea by ID for specific user"""
        return self.db.query(Idea).filter(
            Idea.id == idea_id,
            Idea.user_id == user_id
        ).first()
    
    def update_idea(self, idea_id: int, user_id: UUID, idea_data: IdeaUpdate) -> Optional[IdeaResponse]:
        """Update an existing idea"""
        db_idea = self.get_idea_by_id(idea_id, user_id)
        
        if not db_idea:
            return None
        
        # Update fields that are provided
        update_data = idea_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_idea, field, value)
        
        self.db.commit()
        self.db.refresh(db_idea)
        
        return IdeaResponse.model_validate(db_idea)
    
    def delete_idea(self, idea_id: int, user_id: UUID) -> bool:
        """Delete an idea"""
        db_idea = self.get_idea_by_id(idea_id, user_id)
        
        if not db_idea:
            return False
        
        self.db.delete(db_idea)
        self.db.commit()
        
        return True
    
    def get_user_ideas(self, user_id: UUID) -> List[IdeaResponse]:
        """Get all ideas for a user"""
        ideas = self.db.query(Idea).filter(Idea.user_id == user_id).all()
        return [IdeaResponse.model_validate(idea) for idea in ideas]
    
    def get_total_ideas_count(self) -> int:
        """Get total count of all ideas"""
        return self.db.query(Idea).count()
    
    def get_ideas_by_status(self, status: str) -> List[IdeaResponse]:
        """Get ideas by status"""
        ideas = self.db.query(Idea).filter(Idea.status == status).all()
        return [IdeaResponse.model_validate(idea) for idea in ideas]
