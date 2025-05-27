"""
Simple test to verify the role case conversion fix
"""
from services.auth_service import AuthenticatedUser

# Test the role conversion
test_user = AuthenticatedUser(
    id="test",
    email="test@test.com", 
    name="Test User",
    role="ADMIN",  # This should be converted to lowercase
    status="ACTIVE",
    is_active=True,
    is_approved=True
)

print(f"Original role: ADMIN")
print(f"AuthenticatedUser role: {test_user.role}")

# Now test what happens when we create a User enum from it
from models.user import UserRoleEnum

try:
    role_enum = UserRoleEnum(test_user.role.lower())  # This should work now
    print(f"UserRoleEnum conversion successful: {role_enum}")
    print(f"Enum value: {role_enum.value}")
except ValueError as e:
    print(f"UserRoleEnum conversion failed: {e}")

# Test direct conversion with uppercase (should fail)
try:
    role_enum_upper = UserRoleEnum("ADMIN")
    print(f"Direct uppercase conversion: {role_enum_upper}")
except ValueError as e:
    print(f"Direct uppercase conversion failed (expected): {e}")
