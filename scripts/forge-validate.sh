#!/bin/bash

# Executive Flash News - Forge-Specific Validation Script
# Validates Forge CLI integration and deployment readiness

set -e

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly FORGE_CLI_MIN_VERSION="6.0.0"
readonly MANIFEST_FILE="manifest.yml"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "\n${BLUE}⚒️  Forge Validation: $1${NC}"
}

# Error handling
trap 'log_error "Forge validation failed at line $LINENO"; exit 1' ERR

# Main validation function
main() {
    log_info "Starting Forge CLI Validation for Executive Flash News"
    log_info "Project Root: $PROJECT_ROOT"
    log_info "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

    cd "$PROJECT_ROOT"

    validate_forge_cli
    validate_manifest
    validate_build_artifacts
    validate_permissions
    validate_resources
    validate_deployment_readiness
    validate_app_structure

    log_success "🎉 All Forge validations passed successfully!"
    generate_forge_report
}

validate_forge_cli() {
    log_step "Forge CLI Installation & Configuration"

    # Check if Forge CLI is installed
    if ! command -v forge >/dev/null 2>&1; then
        log_error "Forge CLI is not installed"
        log_info "Install with: npm install -g @forge/cli"
        exit 1
    fi

    # Check Forge CLI version
    local forge_version
    forge_version=$(forge --version | head -1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' || echo "0.0.0")
    log_info "Forge CLI version: $forge_version"

    # Version comparison (basic)
    if [[ "$(printf '%s\n' "$FORGE_CLI_MIN_VERSION" "$forge_version" | sort -V | head -n1)" != "$FORGE_CLI_MIN_VERSION" ]]; then
        log_warning "Forge CLI version $forge_version may be outdated (minimum: $FORGE_CLI_MIN_VERSION)"
    fi

    # Check authentication status
    log_info "Checking Forge authentication..."
    if forge whoami >/dev/null 2>&1; then
        local current_user
        current_user=$(forge whoami 2>/dev/null | head -1 || echo "Unknown")
        log_success "Authenticated as: $current_user"
    else
        log_warning "Forge CLI not authenticated - will require token in CI/CD"
        log_info "Authenticate with: forge login"
    fi

    log_success "Forge CLI validation completed"
}

validate_manifest() {
    log_step "Manifest Validation"

    # Check if manifest exists
    if [[ ! -f "$MANIFEST_FILE" ]]; then
        log_error "Forge manifest.yml not found"
        exit 1
    fi

    log_info "Running forge lint..."
    if ! forge lint >/dev/null 2>&1; then
        log_error "Forge manifest validation failed"
        forge lint
        exit 1
    fi

    # Detailed manifest validation
    log_info "Validating manifest structure..."

    # Check for required top-level fields
    local required_fields=("modules" "app")
    for field in "${required_fields[@]}"; do
        if ! grep -q "^$field:" "$MANIFEST_FILE"; then
            log_error "Required manifest field missing: $field"
            exit 1
        fi
    done

    # Validate app runtime
    if grep -q "runtime:" "$MANIFEST_FILE"; then
        local runtime
        runtime=$(grep "name:" "$MANIFEST_FILE" | grep "nodejs" | head -1 || echo "")
        if [[ -n "$runtime" ]]; then
            log_info "Runtime: $runtime"
        else
            log_warning "No Node.js runtime specified in manifest"
        fi
    fi

    # Check for permissions
    if grep -q "permissions:" "$MANIFEST_FILE"; then
        log_info "Permissions defined in manifest"
        if grep -q "scopes:" "$MANIFEST_FILE"; then
            local scope_count
            scope_count=$(grep -A 10 "scopes:" "$MANIFEST_FILE" | grep -c "- " || echo "0")
            log_info "Found $scope_count permission scopes"
        fi
    else
        log_warning "No permissions defined in manifest"
    fi

    # Validate modules
    if grep -q "jira:" "$MANIFEST_FILE"; then
        log_success "Jira modules configured"
    else
        log_error "No Jira modules found in manifest"
        exit 1
    fi

    log_success "Manifest validation completed"
}

validate_build_artifacts() {
    log_step "Build Artifacts Validation"

    # Run build if artifacts don't exist
    if [[ ! -d "static" ]]; then
        log_info "Build artifacts not found, running build..."
        npm run build
    fi

    # Verify static directory exists
    if [[ ! -d "static" ]]; then
        log_error "Build failed - static directory not created"
        exit 1
    fi

    # Check static directory structure
    local static_size
    static_size=$(du -sh static/ | cut -f1)
    log_info "Build artifacts size: $static_size"

    # Look for essential files
    local has_index=false
    if find static/ -name "index.*" | head -1 | grep -q .; then
        has_index=true
        log_info "Found index file in static/"
    fi

    # Check for overly large build
    local static_size_mb
    static_size_mb=$(du -sm static/ | cut -f1)
    if [[ $static_size_mb -gt 10 ]]; then
        log_warning "Build artifacts are quite large (${static_size_mb}MB)"
    fi

    # Validate resource path in manifest matches static structure
    if grep -q "path: static/" "$MANIFEST_FILE"; then
        log_success "Manifest resource path matches build output"
    else
        log_warning "Check manifest resource path alignment with static/"
    fi

    log_success "Build artifacts validation completed"
}

validate_permissions() {
    log_step "Permissions & Scopes Validation"

    # Extract and validate permissions from manifest
    if grep -A 20 "permissions:" "$MANIFEST_FILE" | grep -q "scopes:"; then
        log_info "Validating permission scopes..."

        # Common Jira scopes validation
        local scopes_section
        scopes_section=$(grep -A 20 "scopes:" "$MANIFEST_FILE" | grep "- " || echo "")

        if echo "$scopes_section" | grep -q "read:jira-user"; then
            log_info "✓ Jira user read permissions"
        fi

        if echo "$scopes_section" | grep -q "read:jira-work"; then
            log_info "✓ Jira work read permissions"
        fi

        # Check for potentially dangerous permissions
        if echo "$scopes_section" | grep -qi "admin\|delete\|write"; then
            log_warning "Elevated permissions detected - ensure they are necessary"
        fi

    else
        log_error "No permission scopes defined"
        exit 1
    fi

    log_success "Permissions validation completed"
}

validate_resources() {
    log_step "Resources Configuration Validation"

    # Check resources section in manifest
    if ! grep -q "resources:" "$MANIFEST_FILE"; then
        log_error "No resources section found in manifest"
        exit 1
    fi

    # Validate resource paths
    local resource_paths
    resource_paths=$(grep -A 10 "resources:" "$MANIFEST_FILE" | grep "path:" | awk '{print $2}' || echo "")

    if [[ -n "$resource_paths" ]]; then
        echo "$resource_paths" | while read -r path; do
            if [[ -n "$path" && -d "$path" ]]; then
                log_info "✓ Resource path exists: $path"
            elif [[ -n "$path" ]]; then
                log_warning "Resource path not found: $path"
            fi
        done
    fi

    log_success "Resources validation completed"
}

validate_deployment_readiness() {
    log_step "Deployment Readiness Check"

    # Check if app is already deployed (if authenticated)
    if forge whoami >/dev/null 2>&1; then
        log_info "Checking deployment status..."

        # Try to list apps (if any exist)
        if forge list >/dev/null 2>&1; then
            local app_list
            app_list=$(forge list 2>/dev/null | grep -v "No apps found" || echo "")
            if [[ -n "$app_list" ]]; then
                log_info "Found existing Forge apps"
                echo "$app_list" | head -5  # Show first 5 lines
            else
                log_info "No existing apps found"
            fi
        fi
    fi

    # Validate deployment dependencies
    log_info "Checking deployment dependencies..."

    # Node.js version check
    local node_version
    node_version=$(node --version)
    log_info "Node.js version: $node_version"

    # npm configuration check
    if npm config get registry >/dev/null 2>&1; then
        local npm_registry
        npm_registry=$(npm config get registry)
        log_info "npm registry: $npm_registry"
    fi

    # Check for CI/CD specific requirements
    log_info "Validating CI/CD compatibility..."

    # Non-interactive deployment readiness
    if [[ -n "${CI}" || -n "${GITHUB_ACTIONS}" ]]; then
        log_info "CI/CD environment detected"

        # Check for required environment variables
        if [[ -z "${FORGE_API_TOKEN}" ]]; then
            log_warning "FORGE_API_TOKEN not set - required for CI/CD deployment"
        fi
    fi

    log_success "Deployment readiness check completed"
}

validate_app_structure() {
    log_step "App Structure Validation"

    # Validate source structure
    if [[ ! -d "src" ]]; then
        log_error "Source directory 'src' not found"
        exit 1
    fi

    # Check for entry point
    local entry_points=("src/index.js" "src/index.ts" "src/resolver.js" "src/resolver.ts")
    local found_entry=false

    for entry in "${entry_points[@]}"; do
        if [[ -f "$entry" ]]; then
            found_entry=true
            log_info "✓ Entry point found: $entry"
            break
        fi
    done

    if [[ "$found_entry" = false ]]; then
        log_warning "No standard entry point found in src/"
    fi

    # Validate function configuration in manifest
    if grep -q "function:" "$MANIFEST_FILE"; then
        log_info "Function modules configured"

        # Check handler references
        if grep -q "handler:" "$MANIFEST_FILE"; then
            local handlers
            handlers=$(grep "handler:" "$MANIFEST_FILE" | awk '{print $2}' || echo "")
            log_info "Function handlers: $handlers"
        fi
    fi

    # Check for common Forge patterns
    local forge_imports=false
    if grep -r "@forge/" src/ --include="*.js" --include="*.ts" >/dev/null 2>&1; then
        forge_imports=true
        log_info "✓ Forge API imports found"
    fi

    if [[ "$forge_imports" = false ]]; then
        log_warning "No Forge API imports found - ensure proper integration"
    fi

    log_success "App structure validation completed"
}

generate_forge_report() {
    log_info "Generating Forge validation report..."

    local report_file="forge-validation-report.txt"
    cat > "$report_file" << EOF
Executive Flash News - Forge Validation Report
===============================================
Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')
Project: Executive Flash News Jira Plugin

Forge CLI Status:
$(forge --version 2>/dev/null || echo "Not available")

Validation Results:
✅ Forge CLI Installation - VERIFIED
✅ Manifest Structure - VALIDATED
✅ Build Artifacts - READY
✅ Permissions & Scopes - CONFIGURED
✅ Resources Configuration - VALID
✅ Deployment Readiness - READY
✅ App Structure - VALIDATED

Deployment Summary:
- Forge CLI: Ready
- Manifest: Valid
- Build: Successful
- Permissions: Configured
- Ready for deployment to Forge

EOF

    log_success "Forge validation report generated: $report_file"
}

# Utility function for version comparison
version_compare() {
    if [[ $1 == $2 ]]; then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    # fill empty fields in ver1 with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++)); do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ -z ${ver2[i]} ]]; then
            # fill empty fields in ver2 with zeros
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]})); then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]})); then
            return 2
        fi
    done
    return 0
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi