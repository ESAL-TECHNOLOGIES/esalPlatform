"""
Test fixtures and sample data for ESAL Platform tests
"""

# Sample user data for different user types
SAMPLE_USERS = {
    "innovator": {
        "email": "innovator@test.com",
        "password": "TestPassword123!",
        "user_type": "innovator",
        "profile": {
            "name": "Jane Innovator",
            "bio": "A creative innovator with breakthrough ideas",
            "location": "San Francisco, CA",
            "expertise": ["AI", "Machine Learning", "IoT"]
        }
    },
    "investor": {
        "email": "investor@test.com",
        "password": "TestPassword123!",
        "user_type": "investor",
        "profile": {
            "name": "John Investor",
            "bio": "Experienced angel investor focusing on tech startups",
            "location": "New York, NY",
            "investment_focus": ["AI", "FinTech", "HealthTech"],
            "portfolio_size": "50-100 investments",
            "check_size": "$25K-$100K"
        }
    },
    "startup": {
        "email": "startup@test.com",
        "password": "TestPassword123!",
        "user_type": "startup",
        "profile": {
            "name": "Tech Startup",
            "bio": "A promising tech startup disrupting the market",
            "location": "Austin, TX",
            "industry": "Technology",
            "stage": "Seed",
            "team_size": "5-10 employees"
        }
    },
    "admin": {
        "email": "admin@test.com",
        "password": "AdminPassword123!",
        "user_type": "admin",
        "profile": {
            "name": "Platform Admin",
            "bio": "ESAL Platform administrator",
            "location": "Remote"
        }
    }
}

# Sample startup data
SAMPLE_STARTUPS = [
    {
        "name": "AI Vision Corp",
        "industry": "Artificial Intelligence",
        "stage": "Seed",
        "description": "Computer vision solutions for autonomous vehicles",
        "seeking": "2000000",
        "valuation": "8000000",
        "team_size": "8",
        "location": "Palo Alto, CA",
        "founded_year": "2024",
        "business_model": "B2B SaaS",
        "revenue_stage": "Pre-revenue"
    },
    {
        "name": "GreenTech Solutions",
        "industry": "CleanTech",
        "stage": "Series A",
        "description": "Renewable energy storage systems",
        "seeking": "5000000",
        "valuation": "20000000",
        "team_size": "15",
        "location": "Denver, CO",
        "founded_year": "2023",
        "business_model": "Hardware + Software",
        "revenue_stage": "Early revenue"
    },
    {
        "name": "HealthAI",
        "industry": "HealthTech",
        "stage": "Pre-seed",
        "description": "AI-powered diagnostic tools for medical professionals",
        "seeking": "500000",
        "valuation": "3000000",
        "team_size": "4",
        "location": "Boston, MA",
        "founded_year": "2024",
        "business_model": "B2B SaaS",
        "revenue_stage": "Pre-revenue"
    }
]

# Sample innovation ideas
SAMPLE_IDEAS = [
    {
        "title": "Smart Urban Farming System",
        "description": "An IoT-based vertical farming solution for urban environments",
        "industry": "AgTech",
        "stage": "concept",
        "funding_needed": "150000",
        "problem_statement": "Urban areas lack access to fresh, locally grown produce",
        "solution": "Automated vertical farming systems using AI and IoT sensors",
        "target_market": "Urban communities and restaurants",
        "competitive_advantage": "30% more efficient than traditional farming",
        "tags": ["IoT", "AI", "Sustainability", "Urban Planning"]
    },
    {
        "title": "Mental Health Companion App",
        "description": "AI-powered mental health support and therapy matching platform",
        "industry": "HealthTech",
        "stage": "prototype",
        "funding_needed": "300000",
        "problem_statement": "Limited access to mental health resources and long wait times",
        "solution": "AI chatbot for immediate support + therapist matching algorithm",
        "target_market": "Young adults and remote workers",
        "competitive_advantage": "24/7 availability and personalized matching",
        "tags": ["AI", "Mental Health", "Mobile App", "Therapy"]
    },
    {
        "title": "Blockchain Supply Chain Tracker",
        "description": "Transparent supply chain tracking using blockchain technology",
        "industry": "Logistics",
        "stage": "mvp",
        "funding_needed": "500000",
        "problem_statement": "Lack of transparency in global supply chains",
        "solution": "Blockchain-based tracking system with QR code integration",
        "target_market": "Manufacturing companies and retailers",
        "competitive_advantage": "Immutable records and real-time tracking",
        "tags": ["Blockchain", "Supply Chain", "Transparency", "IoT"]
    }
]

# Sample investment opportunities
SAMPLE_OPPORTUNITIES = [
    {
        "startup_name": "EcoTech Innovations",
        "industry": "CleanTech",
        "stage": "Series A",
        "seeking": "3000000",
        "valuation": "15000000",
        "pitch_summary": "Revolutionary solar panel technology with 40% higher efficiency",
        "team_experience": "Former Tesla and SolarCity engineers",
        "market_size": "500B renewable energy market",
        "traction": "2M ARR, 150% YoY growth",
        "use_of_funds": "Manufacturing scale-up and market expansion"
    },
    {
        "startup_name": "FinTech Pro",
        "industry": "FinTech",
        "stage": "Seed",
        "seeking": "1500000",
        "valuation": "6000000",
        "pitch_summary": "AI-powered personal finance management for millennials",
        "team_experience": "Ex-Goldman Sachs and Google team",
        "market_size": "100B personal finance software market",
        "traction": "50K active users, 20% MoM growth",
        "use_of_funds": "Product development and customer acquisition"
    }
]

# Sample investor profiles
SAMPLE_INVESTOR_PROFILES = [
    {
        "name": "Sarah Johnson",
        "type": "Angel Investor",
        "focus_areas": ["AI", "HealthTech", "EdTech"],
        "check_size": "25K-100K",
        "portfolio_companies": 25,
        "successful_exits": 8,
        "investment_criteria": {
            "stage": ["Pre-seed", "Seed"],
            "geography": ["US", "Canada"],
            "team_size": "2-20"
        }
    },
    {
        "name": "TechVentures Capital",
        "type": "VC Fund",
        "focus_areas": ["Enterprise Software", "AI", "Cybersecurity"],
        "check_size": "1M-10M",
        "portfolio_companies": 50,
        "successful_exits": 15,
        "investment_criteria": {
            "stage": ["Series A", "Series B"],
            "geography": ["Global"],
            "revenue_requirement": "1M+ ARR"
        }
    }
]

# API endpoint test data
API_TEST_DATA = {
    "auth": {
        "valid_login": {
            "email": "test@example.com",
            "password": "TestPassword123!"
        },
        "invalid_login": {
            "email": "invalid@example.com",
            "password": "wrongpassword"
        },
        "registration": {
            "email": "newuser@example.com",
            "password": "NewPassword123!",
            "user_type": "innovator"
        }
    },
    "ideas": {
        "valid_submission": {
            "title": "Test Innovation",
            "description": "A test innovation for API testing",
            "industry": "Technology",
            "stage": "concept"
        },
        "invalid_submission": {
            "title": "",  # Missing required field
            "description": "Invalid submission test"
        }
    },
    "profiles": {
        "update_data": {
            "name": "Updated Name",
            "bio": "Updated bio information",
            "location": "Updated Location"
        }
    }
}

# Database test data
DB_TEST_DATA = {
    "users_table": "test_users",
    "ideas_table": "test_ideas",
    "startups_table": "test_startups",
    "investments_table": "test_investments"
}
