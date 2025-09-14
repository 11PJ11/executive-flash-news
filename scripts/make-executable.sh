#!/bin/bash

# Executive Flash News - Make Scripts Executable
# This script ensures all necessary scripts have proper permissions

set -e

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

main() {
    log_info "Making scripts executable for Executive Flash News CI/CD"

    cd "$PROJECT_ROOT"

    # List of scripts to make executable
    local scripts=(
        "scripts/quality-gates.sh"
        "scripts/forge-validate.sh"
        "scripts/atdd-compliance.sh"
        "scripts/make-executable.sh"
    )

    # Make scripts executable
    for script in "${scripts[@]}"; do
        if [[ -f "$script" ]]; then
            chmod +x "$script"
            log_success "Made executable: $script"
        else
            log_info "Script not found (skipping): $script"
        fi
    done

    # Verify executable permissions
    log_info "Verifying script permissions..."
    for script in "${scripts[@]}"; do
        if [[ -f "$script" && -x "$script" ]]; then
            log_success "✓ Executable: $script"
        elif [[ -f "$script" ]]; then
            echo "⚠️  Not executable: $script"
        fi
    done

    log_success "Script permissions configuration completed"
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi