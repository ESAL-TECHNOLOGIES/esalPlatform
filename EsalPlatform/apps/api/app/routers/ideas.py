"""
Ideas router - Metrics and analytics for ideas
"""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random
from pydantic import BaseModel

# Import from the direct schemas.py module instead of the package
import app.schemas as schemas
from app.utils.roles import require_role
import random

router = APIRouter()


class IdeaDetailResponse(BaseModel):
    id: str
    title: str
    description: str
    industry: str
    stage: str
    target_market: str
    funding_needed: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    team_size: Optional[int] = None
    status: str
    ai_score: Optional[float] = None
    created_at: str
    updated_at: str
    views_count: int
    interests_count: int
    user_id: str
    author_name: Optional[str] = None
    comments: List[Dict[str, Any]] = []
    files: List[Dict[str, Any]] = []
    similar_ideas: List[Dict[str, Any]] = []


@router.get("/metrics")
async def get_ideas_metrics(
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> List[Dict[str, Any]]:
    """Get metrics data for user's ideas with realistic demo data"""
    
    # Generate realistic demo data for the metrics
    demo_ideas = [
        {
            "id": "1",
            "title": "AI-Powered Healthcare Diagnostics",
            "views": 245,
            "interests": 18,
            "ai_score": 8.7,
            "status": "active",
            "created_at": (datetime.now() - timedelta(days=15)).isoformat()
        },
        {
            "id": "2", 
            "title": "Sustainable Energy Storage Solution",
            "views": 189,
            "interests": 12,
            "ai_score": 7.9,
            "status": "active",
            "created_at": (datetime.now() - timedelta(days=8)).isoformat()
        },
        {
            "id": "3",
            "title": "Smart Urban Farming Platform",
            "views": 156,
            "interests": 9,
            "ai_score": 7.2,
            "status": "draft",
            "created_at": (datetime.now() - timedelta(days=22)).isoformat()
        },
        {
            "id": "4",
            "title": "Blockchain-Based Supply Chain Tracker",
            "views": 298,
            "interests": 25,
            "ai_score": 9.1,
            "status": "active", 
            "created_at": (datetime.now() - timedelta(days=30)).isoformat()
        },
        {
            "id": "5",
            "title": "AR Education Platform for Remote Learning",
            "views": 134,
            "interests": 7,
            "ai_score": 6.8,
            "status": "active",
            "created_at": (datetime.now() - timedelta(days=5)).isoformat()
        }
    ]
    
    # Add some randomization to make data feel more dynamic
    for idea in demo_ideas:
        # Add small random variation to views (±5)
        idea["views"] += random.randint(-5, 5)
        # Add small random variation to interests (±2)
        idea["interests"] += max(0, random.randint(-2, 2))
        # Ensure minimum values
        idea["views"] = max(0, idea["views"])
        idea["interests"] = max(0, idea["interests"])
    
    return demo_ideas


@router.get("/analytics")
async def get_ideas_analytics(
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> Dict[str, Any]:
    """Get detailed analytics for user's ideas"""
    
    return {
        "overview": {
            "total_ideas": 5,
            "active_ideas": 4,
            "draft_ideas": 1,
            "total_views": 1022,
            "total_interests": 71,
            "avg_ai_score": 7.94
        },
        "performance_trends": {
            "views_last_30_days": [45, 52, 38, 67, 49, 71, 83, 56, 62, 78, 91, 69, 84, 77, 92, 88, 65, 73, 86, 94, 76, 89, 95, 82, 79, 87, 91, 96, 88, 92],
            "interests_last_30_days": [3, 4, 2, 5, 3, 6, 7, 4, 5, 6, 8, 5, 7, 6, 8, 7, 5, 6, 7, 8, 6, 7, 8, 7, 6, 7, 8, 9, 7, 8]
        },
        "top_performing": {
            "most_viewed": {
                "id": "4",
                "title": "Blockchain-Based Supply Chain Tracker",
                "views": 298
            },
            "most_interested": {
                "id": "4", 
                "title": "Blockchain-Based Supply Chain Tracker",
                "interests": 25
            },
            "highest_score": {
                "id": "4",
                "title": "Blockchain-Based Supply Chain Tracker", 
                "ai_score": 9.1
            }
        },
        "categories": {
            "technology": 3,
            "sustainability": 1,
            "education": 1
        }
    }


@router.get("/list", response_model=List[Dict[str, Any]])
async def get_all_ideas(
    status: Optional[str] = None,
    industry: Optional[str] = None,
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> List[Dict[str, Any]]:
    """Get all ideas for the current user with filters"""
    
    # Generate some realistic ideas data
    ideas_list = [
        {
            "id": "1",
            "title": "AI-Powered Healthcare Diagnostics",
            "description": "Using machine learning to quickly identify potential health issues from medical images and patient data.",
            "industry": "Healthcare",
            "stage": "prototype",
            "status": "active",
            "created_at": (datetime.now() - timedelta(days=15)).isoformat(),
            "updated_at": (datetime.now() - timedelta(days=2)).isoformat(),
            "views_count": 245,
            "interests_count": 18
        },
        {
            "id": "2", 
            "title": "Sustainable Energy Storage Solution",
            "description": "Novel battery technology using sustainable materials for longer-lasting energy storage with minimal environmental impact.",
            "industry": "Energy",
            "stage": "early-revenue",
            "status": "active",
            "created_at": (datetime.now() - timedelta(days=45)).isoformat(),
            "updated_at": (datetime.now() - timedelta(days=5)).isoformat(),
            "views_count": 189,
            "interests_count": 12
        },
        {
            "id": "3",
            "title": "Smart Urban Farming Platform",
            "description": "IoT-enabled vertical farming system that optimizes plant growth in urban environments with minimal resource consumption.",
            "industry": "Agriculture",
            "stage": "idea",
            "status": "draft",
            "created_at": (datetime.now() - timedelta(days=22)).isoformat(),
            "updated_at": (datetime.now() - timedelta(days=22)).isoformat(),
            "views_count": 0,
            "interests_count": 0
        },
        {
            "id": "4",
            "title": "Blockchain Supply Chain Verification",
            "description": "Blockchain-based system for verifying authenticity and tracking products throughout the entire supply chain.",
            "industry": "Logistics",
            "stage": "mvp",
            "status": "pending",
            "created_at": (datetime.now() - timedelta(days=5)).isoformat(),
            "updated_at": (datetime.now() - timedelta(days=3)).isoformat(),
            "views_count": 98,
            "interests_count": 5
        },
        {
            "id": "5",
            "title": "Mental Health AI Assistant",
            "description": "AI chatbot specifically designed to provide mental health support, track mood patterns, and suggest personalized coping strategies.",
            "industry": "Healthcare",
            "stage": "growth",
            "status": "active",
            "created_at": (datetime.now() - timedelta(days=90)).isoformat(),
            "updated_at": (datetime.now() - timedelta(days=10)).isoformat(),
            "views_count": 203,
            "interests_count": 15
        }
    ]
    
    # Apply filters if specified
    if status:
        ideas_list = [idea for idea in ideas_list if idea["status"] == status]
        
    if industry:
        ideas_list = [idea for idea in ideas_list if idea["industry"].lower() == industry.lower()]
    
    return ideas_list


@router.get("/{idea_id}", response_model=IdeaDetailResponse)
async def get_idea_details(
    idea_id: str,
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> Dict[str, Any]:
    """Get detailed information about a specific idea"""
    
    # Generate sample idea details based on the ID
    ideas_details = {
        "1": {
            "id": "1",
            "title": "AI-Powered Healthcare Diagnostics",
            "description": "Using machine learning to quickly identify potential health issues from medical images and patient data.",
            "problem": "Traditional diagnostic processes are time-consuming, often leading to delays in treatment and increased healthcare costs.",
            "solution": "Our AI solution analyzes medical images and patient health data in real-time, providing instant diagnostic suggestions with 94% accuracy.",
            "industry": "Healthcare",
            "stage": "prototype",
            "target_market": "Hospitals, clinics, and diagnostic centers globally, with an initial focus on North America and Europe.",
            "funding_needed": "$2.5M",
            "team_size": 8,
            "status": "active",
            "ai_score": 8.7,
            "created_at": (datetime.now() - timedelta(days=15)).isoformat(),
            "updated_at": (datetime.now() - timedelta(days=2)).isoformat(),
            "views_count": 245,
            "interests_count": 18,
            "user_id": current_user.id,
            "author_name": current_user.full_name,
            "comments": [
                {
                    "id": "c1",
                    "content": "I'm interested in your approach to diagnostic accuracy. Do you have any validation studies?",
                    "user_id": "investor123",
                    "user_name": "Robert Chen",
                    "user_role": "investor",
                    "created_at": (datetime.now() - timedelta(days=8)).isoformat()
                },
                {
                    "id": "c2",
                    "content": "This has promising applications in rural healthcare where specialists are scarce.",
                    "user_id": "investor456",
                    "user_name": "Sarah Johnson",
                    "user_role": "investor",
                    "created_at": (datetime.now() - timedelta(days=5)).isoformat()
                }
            ],
            "files": [
                {
                    "id": "f1",
                    "name": "diagnostic_accuracy_report.pdf",
                    "type": "application/pdf",
                    "size": 2458903,
                    "url": "https://example.com/files/diagnostic_report.pdf",
                    "uploaded_at": (datetime.now() - timedelta(days=14)).isoformat()
                },
                {
                    "id": "f2",
                    "name": "product_demo.mp4",
                    "type": "video/mp4",
                    "size": 15784256,
                    "url": "https://example.com/files/product_demo.mp4",
                    "uploaded_at": (datetime.now() - timedelta(days=10)).isoformat()
                }
            ],
            "similar_ideas": [
                {
                    "id": "5",
                    "title": "Mental Health AI Assistant",
                    "industry": "Healthcare",
                    "similarity_score": 0.78
                },
                {
                    "id": "8",
                    "title": "Personalized Medicine Platform",
                    "industry": "Healthcare",
                    "similarity_score": 0.65
                }
            ]
        },
        "2": {
            "id": "2",
            "title": "Sustainable Energy Storage Solution",
            "description": "Novel battery technology using sustainable materials for longer-lasting energy storage with minimal environmental impact.",
            "problem": "Current battery technologies rely on rare earth materials with significant environmental extraction costs and limited capacity.",
            "solution": "Our patented organic compound battery technology provides 40% higher capacity while using sustainable, abundant materials.",
            "industry": "Energy",
            "stage": "early-revenue",
            "target_market": "Renewable energy providers, electric vehicle manufacturers, and grid storage solutions.",
            "funding_needed": "$5M",
            "team_size": 12,
            "status": "active",
            "ai_score": 7.9,
            "created_at": (datetime.now() - timedelta(days=45)).isoformat(),
            "updated_at": (datetime.now() - timedelta(days=5)).isoformat(),
            "views_count": 189,
            "interests_count": 12,
            "user_id": current_user.id,
            "author_name": current_user.full_name,
            "comments": [
                {
                    "id": "c3",
                    "content": "What's your current energy density compared to lithium-ion batteries?",
                    "user_id": "investor789",
                    "user_name": "Michael Thomas",
                    "user_role": "investor",
                    "created_at": (datetime.now() - timedelta(days=30)).isoformat()
                },
                {
                    "id": "c4",
                    "content": "We'd be interested in testing this with our microgrid projects.",
                    "user_id": "hub123",
                    "user_name": "Green Energy Hub",
                    "user_role": "hub",
                    "created_at": (datetime.now() - timedelta(days=20)).isoformat()
                }
            ],
            "files": [
                {
                    "id": "f3",
                    "name": "battery_tech_whitepaper.pdf",
                    "type": "application/pdf",
                    "size": 3641289,
                    "url": "https://example.com/files/battery_tech.pdf",
                    "uploaded_at": (datetime.now() - timedelta(days=44)).isoformat()
                }
            ],
            "similar_ideas": [
                {
                    "id": "9",
                    "title": "Grid-Scale Energy Storage",
                    "industry": "Energy",
                    "similarity_score": 0.82
                }
            ]
        },
        "3": {
            "id": "3",
            "title": "Smart Urban Farming Platform",
            "description": "IoT-enabled vertical farming system that optimizes plant growth in urban environments with minimal resource consumption.",
            "problem": "Urban areas face food security challenges and long supply chains that increase carbon footprint and reduce food freshness.",
            "solution": "Our stackable vertical farming units use IoT sensors, AI optimization, and hydroponic systems to grow food with 95% less water and 30% faster growth.",
            "industry": "Agriculture",
            "stage": "idea",
            "target_market": "Restaurants, grocery stores, community centers, and residential buildings in urban areas.",
            "funding_needed": "$750K",
            "team_size": 4,
            "status": "draft",
            "ai_score": 7.2,
            "created_at": (datetime.now() - timedelta(days=22)).isoformat(),
            "updated_at": (datetime.now() - timedelta(days=22)).isoformat(),
            "views_count": 0,
            "interests_count": 0,
            "user_id": current_user.id,
            "author_name": current_user.full_name,
            "comments": [],
            "files": [],
            "similar_ideas": [
                {
                    "id": "15",
                    "title": "Apartment Microfarming Solution",
                    "industry": "Agriculture",
                    "similarity_score": 0.75
                }
            ]
        },
        "4": {
            "id": "4",
            "title": "Blockchain Supply Chain Verification",
            "description": "Blockchain-based system for verifying authenticity and tracking products throughout the entire supply chain.",
            "problem": "Supply chain fraud, counterfeiting, and lack of transparency costs industries billions annually and erodes consumer trust.",
            "solution": "Our blockchain solution creates an immutable record of each product's journey, enabling easy verification and transparency for businesses and consumers.",
            "industry": "Logistics",
            "stage": "mvp",
            "target_market": "Luxury goods, pharmaceuticals, organic food producers, and international shipping companies.",
            "funding_needed": "$1.2M",
            "team_size": 6,
            "status": "pending",
            "ai_score": 6.8,
            "created_at": (datetime.now() - timedelta(days=5)).isoformat(),
            "updated_at": (datetime.now() - timedelta(days=3)).isoformat(),
            "views_count": 98,
            "interests_count": 5,
            "user_id": current_user.id,
            "author_name": current_user.full_name,
            "comments": [
                {
                    "id": "c5",
                    "content": "Have you considered integration challenges with existing ERP systems?",
                    "user_id": "investor321",
                    "user_name": "David Wilson",
                    "user_role": "investor",
                    "created_at": (datetime.now() - timedelta(days=2)).isoformat()
                }
            ],
            "files": [
                {
                    "id": "f5",
                    "name": "blockchain_architecture.pdf",
                    "type": "application/pdf",
                    "size": 1856239,
                    "url": "https://example.com/files/blockchain_arch.pdf",
                    "uploaded_at": (datetime.now() - timedelta(days=5)).isoformat()
                }
            ],
            "similar_ideas": [
                {
                    "id": "20",
                    "title": "Product Authentication Platform",
                    "industry": "Retail",
                    "similarity_score": 0.70
                }
            ]
        },
        "5": {
            "id": "5",
            "title": "Mental Health AI Assistant",
            "description": "AI chatbot specifically designed to provide mental health support, track mood patterns, and suggest personalized coping strategies.",
            "problem": "Mental health services are often inaccessible due to cost, stigma, or availability, leaving many without adequate support.",
            "solution": "Our AI assistant provides 24/7 accessible mental health support using evidence-based therapeutic techniques and personalized tracking.",
            "industry": "Healthcare",
            "stage": "growth",
            "target_market": "Healthcare providers, employee wellness programs, universities, and direct-to-consumer.",
            "funding_needed": "$3M",
            "team_size": 15,
            "status": "active",
            "ai_score": 8.2,
            "created_at": (datetime.now() - timedelta(days=90)).isoformat(),
            "updated_at": (datetime.now() - timedelta(days=10)).isoformat(),
            "views_count": 203,
            "interests_count": 15,
            "user_id": current_user.id,
            "author_name": current_user.full_name,
            "comments": [
                {
                    "id": "c6",
                    "content": "How are you handling data privacy concerns with sensitive mental health information?",
                    "user_id": "investor555",
                    "user_name": "Patricia Lee",
                    "user_role": "investor",
                    "created_at": (datetime.now() - timedelta(days=60)).isoformat()
                },
                {
                    "id": "c7",
                    "content": "We'd love to deploy this with our university students as a pilot.",
                    "user_id": "hub456",
                    "user_name": "Tech Innovation Hub",
                    "user_role": "hub",
                    "created_at": (datetime.now() - timedelta(days=45)).isoformat()
                }
            ],
            "files": [
                {
                    "id": "f6",
                    "name": "clinical_validation_study.pdf",
                    "type": "application/pdf",
                    "size": 4125789,
                    "url": "https://example.com/files/clinical_study.pdf",
                    "uploaded_at": (datetime.now() - timedelta(days=85)).isoformat()
                }
            ],
            "similar_ideas": [
                {
                    "id": "1",
                    "title": "AI-Powered Healthcare Diagnostics",
                    "industry": "Healthcare",
                    "similarity_score": 0.78
                }
            ]
        }
    }
    
    if idea_id not in ideas_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Idea with ID {idea_id} not found"
        )
    
    return ideas_details[idea_id]


@router.post("/{idea_id}/comment", response_model=Dict[str, Any])
async def add_comment(
    idea_id: str,
    comment_data: schemas.CommentCreate,
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> Dict[str, Any]:
    """Add a comment to an idea"""
    
    # Generate a new ID for the comment
    new_comment_id = f"c{random.randint(10, 100)}"
    
    # Create new comment object
    new_comment = {
        "id": new_comment_id,
        "content": comment_data.content,
        "user_id": current_user.id,
        "user_name": current_user.full_name,
        "user_role": current_user.role,
        "created_at": datetime.now().isoformat()
    }
    
    # In a real application, we would save this to a database
    
    return {
        "message": "Comment added successfully",
        "comment": new_comment
    }


@router.post("/{idea_id}/upload-file")
async def upload_file(
    idea_id: str,
    file: UploadFile = File(...),
    description: str = Form(None),
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> Dict[str, Any]:
    """Upload a file attachment for an idea"""
    
    # Generate a new ID for the file
    new_file_id = f"f{random.randint(10, 100)}"
    
    # Create a simulated file object
    file_data = {
        "id": new_file_id,
        "name": file.filename,
        "type": file.content_type,
        "size": random.randint(100000, 5000000),  # Simulated file size
        "url": f"https://example.com/files/{file.filename}",
        "description": description,
        "uploaded_at": datetime.now().isoformat()
    }
    
    # In a real application, we would save the file and metadata to storage/database
    
    return {
        "message": "File uploaded successfully",
        "file": file_data
    }


@router.put("/{idea_id}", response_model=Dict[str, Any])
async def update_idea(
    idea_id: str,
    idea_data: schemas.IdeaCreate,
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> Dict[str, Any]:
    """Update an existing idea"""
    
    # Check if idea exists and belongs to current user
    # In a real application, this would be a database query
    if idea_id not in ["1", "2", "3", "4", "5"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Idea with ID {idea_id} not found"
        )
    
    # Update idea with new data
    updated_idea = {
        "id": idea_id,
        "title": idea_data.title,
        "description": idea_data.description,
        "industry": idea_data.industry,
        "stage": idea_data.stage,
        "target_market": idea_data.target_market,
        "funding_needed": getattr(idea_data, "funding_needed", None),
        "problem": getattr(idea_data, "problem", None),
        "solution": getattr(idea_data, "solution", None),
        "updated_at": datetime.now().isoformat()
    }
    
    # In a real application, we would save this to a database
    
    return {
        "message": f"Idea {idea_id} updated successfully",
        "idea": updated_idea
    }


@router.delete("/{idea_id}", response_model=Dict[str, str])
async def delete_idea(
    idea_id: str,
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> Dict[str, str]:
    """Delete an idea"""
    
    # Check if idea exists and belongs to current user
    # In a real application, this would be a database query
    if idea_id not in ["1", "2", "3", "4", "5"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Idea with ID {idea_id} not found"
        )
    
    # In a real application, we would delete from database
    
    return {
        "message": f"Idea {idea_id} deleted successfully"
    }


@router.post("/upload", response_model=Dict[str, Any])
async def upload_idea(
    idea_data: schemas.IdeaCreate,
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> Dict[str, Any]:
    """Upload a new idea"""
    
    # Generate a new ID for the idea
    new_id = str(random.randint(6, 100))
    
    # Create a new idea object
    new_idea = {
        "id": new_id,
        "title": idea_data.title,
        "description": idea_data.description,
        "industry": idea_data.industry,
        "stage": idea_data.stage,
        "target_market": idea_data.target_market,
        "funding_needed": getattr(idea_data, "funding_needed", None),
        "problem": getattr(idea_data, "problem", None),
        "solution": getattr(idea_data, "solution", None),
        "status": "draft",
        "ai_score": round(random.uniform(5.5, 8.5), 1),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "views_count": 0,
        "interests_count": 0,
        "user_id": current_user.id,
        "author_name": current_user.full_name,
        "comments": [],
        "files": []
    }
    
    # In a real application, we would save this to a database
    
    return {
        "message": "Idea uploaded successfully",
        "idea": new_idea
    }
