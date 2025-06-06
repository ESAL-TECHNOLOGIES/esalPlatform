#!/bin/bash

# ESAL Platform Deployment Helper Script
# This script helps prepare your environment for Supabase + Render deployment

set -e

echo "🚀 ESAL Platform Deployment Helper"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running from project root
if [[ ! -f "package.json" ]] || [[ ! -d "apps" ]]; then
    print_error "Please run this script from the ESAL Platform project root directory"
    exit 1
fi

print_status "Project directory validated"

# Check for required tools
check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm not found, installing..."
        npm install -g pnpm
    fi
    
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    
    print_status "All dependencies are available"
}

# Setup environment files
setup_environment() {
    print_info "Setting up environment configuration..."
    
    # Ensure secrets directory exists
    mkdir -p secrets/environments
    
    # Check if production environment file exists
    if [[ ! -f "secrets/environments/.env.production" ]]; then
        print_warning "Production environment file not found, creating template..."
        cat > secrets/environments/.env.production << EOF
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
DEBUG=false
ENVIRONMENT=production
PROJECT_NAME=ESAL Platform
API_VERSION=v1

# CORS Configuration (update with your Render URLs)
ALLOWED_ORIGINS=https://your-frontend.onrender.com,https://your-api.onrender.com

# JWT Configuration
JWT_SECRET_KEY=$(openssl rand -base64 32)
JWT_ALGORITHM=HS256
JWT_EXPIRATION_TIME=3600

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=ESAL Platform
EOF
        print_status "Created production environment template"
        print_warning "Please update secrets/environments/.env.production with your actual values"
    else
        print_status "Production environment file exists"
    fi
}

# Validate project structure
validate_structure() {
    print_info "Validating project structure..."
    
    required_dirs=(
        "apps/api"
        "apps/landing"
        "apps/hub-portal"
        "apps/innovator-portal"
        "apps/investor-portal"
        "apps/admin-portal"
        "secrets"
        "docs"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            print_status "$dir exists"
        else
            print_error "Missing required directory: $dir"
            exit 1
        fi
    done
}

# Test build processes
test_builds() {
    print_info "Testing build processes..."
    
    # Test API dependencies
    if [[ -f "apps/api/requirements.txt" ]]; then
        print_info "Testing API dependencies..."
        cd apps/api
        python3 -m pip install --dry-run -r requirements.txt > /dev/null 2>&1
        if [[ $? -eq 0 ]]; then
            print_status "API dependencies are valid"
        else
            print_warning "Some API dependencies may have issues"
        fi
        cd ../..
    fi
    
    # Test frontend builds
    frontends=("landing" "hub-portal" "innovator-portal" "investor-portal" "admin-portal")
    
    for frontend in "${frontends[@]}"; do
        if [[ -f "apps/$frontend/package.json" ]]; then
            print_info "Testing $frontend build..."
            cd "apps/$frontend"
            
            # Install dependencies (dry run)
            if pnpm install --frozen-lockfile --dry-run > /dev/null 2>&1; then
                print_status "$frontend dependencies are valid"
            else
                print_warning "$frontend dependencies may have issues"
            fi
            
            cd ../..
        fi
    done
}

# Generate deployment commands
generate_commands() {
    print_info "Generating deployment commands..."
    
    cat > deployment-commands.md << EOF
# ESAL Platform Deployment Commands

## Render API Service Configuration

**Build Command:**
\`\`\`bash
pip install -r requirements.txt
\`\`\`

**Start Command:**
\`\`\`bash
uvicorn main:app --host 0.0.0.0 --port \$PORT
\`\`\`

## Render Static Sites Configuration

### Landing Page
- **Root Directory:** \`apps/landing\`
- **Build Command:** \`pnpm install && pnpm run build\`
- **Publish Directory:** \`dist\`

### Hub Portal
- **Root Directory:** \`apps/hub-portal\`
- **Build Command:** \`pnpm install && pnpm run build\`
- **Publish Directory:** \`dist\`

### Innovator Portal
- **Root Directory:** \`apps/innovator-portal\`
- **Build Command:** \`pnpm install && pnpm run build\`
- **Publish Directory:** \`dist\`

### Investor Portal
- **Root Directory:** \`apps/investor-portal\`
- **Build Command:** \`pnpm install && pnpm run build\`
- **Publish Directory:** \`dist\`

### Admin Portal
- **Root Directory:** \`apps/admin-portal\`
- **Build Command:** \`pnpm install && pnpm run build\`
- **Publish Directory:** \`dist\`

## Environment Variables for Render

Copy these to each service:

### API Service
$(cat secrets/environments/.env.production | grep -v '^#' | grep -v '^$')

### Frontend Services
\`\`\`
VITE_API_URL=https://your-api.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

## Next Steps

1. Create Supabase project and update environment variables
2. Push code to GitHub repository
3. Create Render services using the configurations above
4. Deploy in this order: API → Frontends → Update CORS

EOF

    print_status "Generated deployment-commands.md"
}

# Main execution
main() {
    echo
    print_info "Starting deployment preparation..."
    echo
    
    check_dependencies
    validate_structure
    setup_environment
    test_builds
    generate_commands
    
    echo
    print_status "Deployment preparation complete!"
    echo
    print_info "Next steps:"
    echo "  1. Update secrets/environments/.env.production with your values"
    echo "  2. Review deployment-commands.md for Render configuration"
    echo "  3. Follow the deployment guide: docs/deployment/README.md"
    echo "  4. Use quick reference: docs/deployment/quick-reference.md"
    echo
    print_warning "Remember to keep your environment variables secure!"
}

# Run main function
main "$@"
