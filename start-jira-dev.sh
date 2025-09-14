#!/bin/bash
# start-jira-dev.sh - Enhanced Jira Development Environment Startup

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi

    print_success "Docker and Docker Compose are available"
}

# Function to cleanup on exit
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Script failed. Check logs with: docker-compose logs"
        print_error "To cleanup, run: docker-compose down"
    fi
}

trap cleanup EXIT

print_status "🚀 Starting Jira Development Environment..."

# Check prerequisites
check_docker

# Stop any existing containers
print_status "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Create required directories with proper permissions
print_status "📁 Creating required directories..."
mkdir -p plugins logs
chmod 755 plugins logs

# Start services
print_status "🐳 Starting Docker services..."
if ! docker-compose up -d; then
    print_error "Failed to start Docker services"
    exit 1
fi

print_success "Services started successfully"

# Wait for database to be healthy
print_status "⏳ Waiting for database to be ready..."
timeout=120
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if docker-compose exec -T database pg_isready -U jira -d jira >/dev/null 2>&1; then
        print_success "Database is ready"
        break
    fi

    if [ $((elapsed % 10)) -eq 0 ]; then
        print_status "Database still starting... (${elapsed}s elapsed)"
    fi

    sleep 2
    elapsed=$((elapsed + 2))
done

if [ $elapsed -ge $timeout ]; then
    print_error "Database failed to start within ${timeout} seconds"
    print_error "Check database logs with: docker-compose logs database"
    exit 1
fi

# Display connection information
print_success "🔗 Services Information:"
echo "   Jira URL: http://localhost:8080"
echo "   Database: localhost:5432 (jira/jira_secure_password)"
echo "   Plugin directory: $(pwd)/plugins/"
echo "   Logs directory: $(pwd)/logs/"

# Wait for Jira to be fully ready
print_status "⏳ Waiting for Jira to be fully ready (this may take 3-5 minutes)..."
jira_timeout=300
jira_elapsed=0
while [ $jira_elapsed -lt $jira_timeout ]; do
    # Check if Jira is responding
    if curl -f -s --connect-timeout 5 http://localhost:8080/status >/dev/null 2>&1; then
        print_success "Jira is responding on /status endpoint"
        break
    elif curl -f -s --connect-timeout 5 http://localhost:8080/ >/dev/null 2>&1; then
        print_success "Jira is responding on root endpoint"
        break
    fi

    # Show progress every 15 seconds
    if [ $((jira_elapsed % 15)) -eq 0 ]; then
        print_status "Jira still starting... (${jira_elapsed}s elapsed)"
        # Show container status
        if [ $((jira_elapsed % 30)) -eq 0 ] && [ $jira_elapsed -gt 0 ]; then
            print_status "Container status:"
            docker-compose ps --format table
        fi
    fi

    sleep 3
    jira_elapsed=$((jira_elapsed + 3))
done

if [ $jira_elapsed -ge $jira_timeout ]; then
    print_warning "Jira did not respond within ${jira_timeout} seconds"
    print_warning "This is normal for first startup. Jira may still be initializing."
    print_warning "Check Jira logs with: docker-compose logs jira"
else
    print_success "✅ Jira Development Environment is ready!"
fi

print_success "🔑 Access Jira at: http://localhost:8080"
print_status "📋 Useful commands:"
echo "   View logs: docker-compose logs -f [jira|database]"
echo "   Stop services: docker-compose down"
echo "   Restart: docker-compose restart [jira|database]"
echo "   Reset data: docker-compose down -v"

print_success "🎉 Jira Development Environment startup completed!"