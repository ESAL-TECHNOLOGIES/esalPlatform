import sys
sys.path.append('.')

from services.auth_service import authenticate_user

# Test authentication
result = authenticate_user("admin@esal.com", "admin123")
print(f"Authentication result: {result}")

if result:
    print(f"User role: {result.role}")
    print(f"Role type: {type(result.role)}")
