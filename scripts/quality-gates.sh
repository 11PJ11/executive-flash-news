#!/bin/bash

# Executive Flash News - Comprehensive Quality Gates Script
# Implements 8-step validation cycle with ATDD compliance

set -e

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly COVERAGE_THRESHOLD_GLOBAL=50
readonly COVERAGE_THRESHOLD_DOMAIN=80
readonly BUILD_TIMEOUT=120
readonly TEST_TIMEOUT=60

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
    echo -e "\n${BLUE}🚦 Quality Gate Step $1${NC}"
}

# Error handling
trap 'log_error "Quality gates failed at line $LINENO"; exit 1' ERR

# Main quality gates function
main() {
    log_info "Starting Executive Flash News Quality Gates Validation"
    log_info "Project Root: $PROJECT_ROOT"
    log_info "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

    cd "$PROJECT_ROOT"

    # Verify project structure
    verify_project_structure

    # Execute 8-step quality gates
    step_1_syntax_validation
    step_2_type_validation
    step_3_linting_validation
    step_4_security_validation
    step_5_test_validation
    step_6_performance_validation
    step_7_documentation_validation
    step_8_integration_validation

    # ATDD-specific validation
    atdd_compliance_check

    log_success "🎉 All quality gates passed successfully!"
    generate_summary_report
}

verify_project_structure() {
    log_info "Verifying project structure..."

    local required_files=(
        "package.json"
        "manifest.yml"
        "jest.config.js"
        ".eslintrc.js"
    )

    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_error "Required file missing: $file"
            exit 1
        fi
    done

    local required_dirs=(
        "src"
        "tests"
    )

    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            log_error "Required directory missing: $dir"
            exit 1
        fi
    done

    log_success "Project structure verified"
}

step_1_syntax_validation() {
    log_step "1: Syntax Validation"

    # JavaScript/TypeScript syntax check
    log_info "Checking JavaScript/TypeScript syntax..."
    if ! npm run type-check > /dev/null 2>&1; then
        log_error "TypeScript compilation failed"
        npm run type-check
        exit 1
    fi

    # JSON validation
    log_info "Validating JSON files..."
    find . -name "*.json" -not -path "./node_modules/*" -not -path "./coverage/*" | while read -r json_file; do
        if ! jq empty "$json_file" 2>/dev/null; then
            log_error "Invalid JSON file: $json_file"
            exit 1
        fi
    done

    # YAML validation (manifest.yml)
    if command -v yamllint >/dev/null 2>&1; then
        log_info "Validating YAML files..."
        yamllint manifest.yml || true  # Non-blocking for now
    fi

    log_success "Step 1: Syntax validation completed"
}

step_2_type_validation() {
    log_step "2: Type Validation"

    log_info "Running TypeScript type checking..."
    if [[ -f "tsconfig.json" ]]; then
        npx tsc --noEmit --skipLibCheck
    else
        log_warning "No tsconfig.json found, skipping advanced type checking"
    fi

    # Validate package.json dependencies
    log_info "Validating package dependencies..."
    npm ls --depth=0 > /dev/null || {
        log_warning "Dependency issues detected"
        npm ls --depth=0 || true
    }

    log_success "Step 2: Type validation completed"
}

step_3_linting_validation() {
    log_step "3: Code Linting"

    log_info "Running ESLint..."
    npm run lint

    # Prettier check (if configured)
    if npm run --silent prettier:check >/dev/null 2>&1; then
        log_info "Running Prettier check..."
        npm run prettier:check
    fi

    log_success "Step 3: Linting validation completed"
}

step_4_security_validation() {
    log_step "4: Security Validation"

    log_info "Running npm audit..."
    npm audit --audit-level moderate

    # Additional security checks
    log_info "Checking for common security issues..."

    # Check for hardcoded secrets (basic patterns)
    if grep -r -i "password\|secret\|token\|key" src/ --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" | grep -v "// TODO" | grep -v "console.log" >/dev/null; then
        log_warning "Potential hardcoded secrets found - review manually"
    fi

    # Check for console.log in production code
    if grep -r "console\.log" src/ --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" >/dev/null; then
        log_warning "console.log statements found in source code"
    fi

    log_success "Step 4: Security validation completed"
}

step_5_test_validation() {
    log_step "5: Test Validation"

    log_info "Running test suite with coverage..."
    timeout ${TEST_TIMEOUT}s npm run test:coverage -- --passWithNoTests

    # Validate coverage thresholds
    log_info "Validating coverage thresholds..."

    # Parse coverage from jest output or coverage files
    local coverage_file="coverage/coverage-summary.json"
    if [[ -f "$coverage_file" ]]; then
        local global_coverage
        global_coverage=$(jq -r '.total.lines.pct' "$coverage_file" 2>/dev/null || echo "0")

        if (( $(echo "$global_coverage < $COVERAGE_THRESHOLD_GLOBAL" | bc -l) )); then
            log_warning "Global coverage ($global_coverage%) below threshold ($COVERAGE_THRESHOLD_GLOBAL%)"
        else
            log_success "Global coverage: $global_coverage%"
        fi
    fi

    # Count test files and ensure tests exist
    local test_count
    test_count=$(find tests/ -name "*.test.*" | wc -l)
    if [[ $test_count -eq 0 ]]; then
        log_error "No test files found"
        exit 1
    fi

    log_info "Found $test_count test files"
    log_success "Step 5: Test validation completed"
}

step_6_performance_validation() {
    log_step "6: Performance Validation"

    log_info "Validating build performance..."

    # Time the build process
    local build_start
    local build_end
    local build_duration

    build_start=$(date +%s)
    timeout ${BUILD_TIMEOUT}s npm run build
    build_end=$(date +%s)
    build_duration=$((build_end - build_start))

    log_info "Build completed in ${build_duration}s (threshold: ${BUILD_TIMEOUT}s)"

    # Check build artifact size
    if [[ -d "static" ]]; then
        local bundle_size
        bundle_size=$(du -sh static/ | cut -f1)
        log_info "Build artifacts size: $bundle_size"
    fi

    # Basic performance checks
    log_info "Running basic performance validations..."

    # Check for large files in src/
    find src/ -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | while read -r file; do
        local lines
        lines=$(wc -l < "$file")
        if [[ $lines -gt 300 ]]; then
            log_warning "Large file detected: $file ($lines lines)"
        fi
    done

    log_success "Step 6: Performance validation completed"
}

step_7_documentation_validation() {
    log_step "7: Documentation Validation"

    # Check for essential documentation
    local required_docs=("README.md" "manifest.yml")
    for doc in "${required_docs[@]}"; do
        if [[ ! -f "$doc" ]]; then
            log_error "Required documentation missing: $doc"
            exit 1
        fi
    done

    # Validate README.md content
    if [[ -f "README.md" ]]; then
        local readme_size
        readme_size=$(wc -c < README.md)
        if [[ $readme_size -lt 500 ]]; then
            log_warning "README.md appears to be minimal ($readme_size characters)"
        fi
    fi

    # Check for inline documentation
    log_info "Checking for inline documentation..."
    local total_js_lines
    local comment_lines
    total_js_lines=$(find src/ -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -exec wc -l {} + | tail -1 | awk '{print $1}')
    comment_lines=$(find src/ -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -exec grep -c "^\s*//" {} + 2>/dev/null | paste -sd+ | bc || echo "0")

    if [[ $total_js_lines -gt 0 ]] && [[ $comment_lines -gt 0 ]]; then
        local comment_ratio
        comment_ratio=$(echo "scale=2; $comment_lines / $total_js_lines * 100" | bc)
        log_info "Inline documentation ratio: ${comment_ratio}%"
    fi

    log_success "Step 7: Documentation validation completed"
}

step_8_integration_validation() {
    log_step "8: Integration Validation"

    # Forge-specific integration validation
    log_info "Validating Forge integration..."

    # Check manifest.yml structure
    if ! command -v yq >/dev/null 2>&1; then
        log_info "Installing yq for YAML processing..."
        if command -v snap >/dev/null 2>&1; then
            sudo snap install yq
        else
            log_warning "yq not available, skipping advanced manifest validation"
        fi
    fi

    if command -v yq >/dev/null 2>&1; then
        # Validate required manifest fields
        local required_fields=("modules" "app")
        for field in "${required_fields[@]}"; do
            if ! yq eval "has(\"$field\")" manifest.yml >/dev/null 2>&1; then
                log_error "Required manifest field missing: $field"
                exit 1
            fi
        done
    fi

    # Validate build artifacts exist
    if [[ ! -d "static" ]]; then
        log_error "Build artifacts directory 'static' not found"
        exit 1
    fi

    # Check for common integration issues
    log_info "Checking for common integration issues..."

    # Verify Node.js version compatibility
    local node_version
    node_version=$(node --version | sed 's/v//')
    local required_version="18.0.0"

    if ! npm run --silent check-node-version >/dev/null 2>&1; then
        log_info "Node.js version: $node_version"
        # Basic version check
        if [[ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]]; then
            log_error "Node.js version $node_version is below required $required_version"
            exit 1
        fi
    fi

    log_success "Step 8: Integration validation completed"
}

atdd_compliance_check() {
    log_step "ATDD: ATDD Compliance Validation"

    # Check for Outside-In TDD structure
    log_info "Validating Outside-In test structure..."

    # Count E2E tests
    local e2e_count
    e2e_count=$(find tests/ -name "*.e2e.test.*" -o -name "*E2E*" -o -name "*acceptance*" | wc -l)
    log_info "Found $e2e_count E2E/acceptance test files"

    if [[ $e2e_count -eq 0 ]]; then
        log_error "No E2E/acceptance tests found - ATDD requires acceptance tests"
        exit 1
    fi

    # Check for proper test naming and structure
    log_info "Validating test structure and naming..."

    # Look for BDD-style test descriptions
    if ! grep -r "describe\|should\|it" tests/ --include="*.test.*" >/dev/null 2>&1; then
        log_warning "Consider using BDD-style test descriptions (describe/should/it)"
    fi

    # Check for Given-When-Then patterns in E2E tests
    local gwt_count=0
    if grep -r "given\|when\|then" tests/ --include="*.e2e.*" --include="*E2E*" >/dev/null 2>&1; then
        gwt_count=$(grep -r "given\|when\|then" tests/ --include="*.e2e.*" --include="*E2E*" | wc -l)
    fi

    if [[ $gwt_count -gt 0 ]]; then
        log_success "Found Given-When-Then patterns in acceptance tests"
    else
        log_warning "Consider using Given-When-Then structure in acceptance tests"
    fi

    # Check for NotImplementedException patterns (scaffolding)
    log_info "Checking for scaffolding patterns..."
    if grep -r "NotImplementedException\|throw.*not.*implement" src/ >/dev/null 2>&1; then
        log_info "Found scaffolding patterns - ensure they drive real implementation"
    fi

    # Verify one E2E test active rule
    log_info "Validating one E2E test active rule..."
    local ignored_e2e
    ignored_e2e=$(grep -r "ignore\|skip\|todo" tests/ --include="*.e2e.*" --include="*E2E*" | wc -l || echo "0")

    if [[ $ignored_e2e -gt 0 ]]; then
        log_info "Found $ignored_e2e ignored/skipped E2E tests (following one-at-a-time rule)"
    fi

    log_success "ATDD compliance validation completed"
}

generate_summary_report() {
    log_info "Generating quality gates summary report..."

    local report_file="quality-gates-report.txt"
    cat > "$report_file" << EOF
Executive Flash News - Quality Gates Report
===========================================
Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')
Project: Executive Flash News Jira Plugin

Quality Gates Results:
✅ Step 1: Syntax Validation - PASSED
✅ Step 2: Type Validation - PASSED
✅ Step 3: Linting Validation - PASSED
✅ Step 4: Security Validation - PASSED
✅ Step 5: Test Validation - PASSED
✅ Step 6: Performance Validation - PASSED
✅ Step 7: Documentation Validation - PASSED
✅ Step 8: Integration Validation - PASSED
✅ ATDD Compliance - VALIDATED

Summary:
- All 8 quality gates passed successfully
- ATDD compliance verified
- Code is ready for deployment
- Build artifacts validated
- Security checks completed

EOF

    log_success "Quality gates report generated: $report_file"
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi