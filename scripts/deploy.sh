#!/bin/bash

# Firebase Deployment Script
# This script helps test and deploy the application locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="nammal-e6351"
NODE_VERSION="20"

# Functions
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check dependencies
check_dependencies() {
    print_header "Checking Dependencies"
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VER" -ge "$NODE_VERSION" ]; then
            print_success "Node.js version: $(node -v)"
        else
            print_error "Node.js version $(node -v) is too old. Required: v${NODE_VERSION}+"
            exit 1
        fi
    else
        print_error "Node.js not found. Please install Node.js ${NODE_VERSION}+"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        print_success "npm version: $(npm -v)"
    else
        print_error "npm not found"
        exit 1
    fi
    
    # Check Firebase CLI
    if command -v firebase &> /dev/null; then
        print_success "Firebase CLI version: $(firebase --version)"
    else
        print_warning "Firebase CLI not found. Installing..."
        npm install -g firebase-tools
    fi
}

# Install project dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    npm ci
    print_success "Dependencies installed"
}

# Run tests and linting
run_tests() {
    print_header "Running Tests and Checks"
    
    echo "Running TypeScript check..."
    npm run typecheck
    print_success "TypeScript check passed"
    
    echo "Running linter..."
    npm run lint
    print_success "Linting passed"
}

# Build the application
build_app() {
    print_header "Building Application"
    NODE_ENV=production npm run build
    print_success "Build completed"
}

# Deploy to Firebase
deploy_firebase() {
    print_header "Deploying to Firebase"
    
    # Check if user is logged in
    if ! firebase projects:list &> /dev/null; then
        print_warning "Not logged in to Firebase. Please run: firebase login"
        exit 1
    fi
    
    print_warning "This will deploy to production project: $PROJECT_ID"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    
    # Deploy hosting
    echo "Deploying to Firebase Hosting..."
    firebase deploy --only hosting --project $PROJECT_ID
    print_success "Hosting deployed"
    
    # Deploy Firestore rules
    echo "Deploying Firestore rules..."
    firebase deploy --only firestore:rules --project $PROJECT_ID
    print_success "Firestore rules deployed"
    
    # Deploy Firestore indexes
    echo "Deploying Firestore indexes..."
    firebase deploy --only firestore:indexes --project $PROJECT_ID
    print_success "Firestore indexes deployed"
    
    print_success "Deployment completed!"
    echo -e "${GREEN}🌐 Your app is live at: https://${PROJECT_ID}.web.app${NC}"
}

# Preview deployment locally
preview_local() {
    print_header "Starting Local Preview"
    
    if [ ! -d "out" ]; then
        print_warning "Build directory not found. Building first..."
        build_app
    fi
    
    echo "Starting Firebase hosting emulator..."
    firebase serve --only hosting --project $PROJECT_ID
}

# Full pipeline (test, build, deploy)
full_pipeline() {
    print_header "Running Full Deployment Pipeline"
    check_dependencies
    install_dependencies
    run_tests
    build_app
    deploy_firebase
}

# Show help
show_help() {
    echo "Firebase Deployment Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  check      - Check system dependencies"
    echo "  install    - Install project dependencies"
    echo "  test       - Run tests and linting"
    echo "  build      - Build the application"
    echo "  deploy     - Deploy to Firebase (production)"
    echo "  preview    - Start local preview server"
    echo "  pipeline   - Run full pipeline (test → build → deploy)"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 pipeline    # Run complete deployment pipeline"
    echo "  $0 build       # Just build the app"
    echo "  $0 preview     # Preview locally"
}

# Main script logic
case "${1:-help}" in
    "check")
        check_dependencies
        ;;
    "install")
        install_dependencies
        ;;
    "test")
        run_tests
        ;;
    "build")
        build_app
        ;;
    "deploy")
        deploy_firebase
        ;;
    "preview")
        preview_local
        ;;
    "pipeline")
        full_pipeline
        ;;
    "help"|*)
        show_help
        ;;
esac