# 🚀 Next Steps: Complete Environment Setup

## Current Status
✅ **Repository Structure**: Complete with CI/CD pipeline
✅ **E2E Tests**: Properly failing, waiting for real environment
✅ **Forge CLI**: Installed (v12.5.2)
❌ **Forge Authentication**: Not configured
❌ **GitHub Repository**: Not created yet

## Step 1: Create GitHub Repository (5 minutes)

### Using GitHub CLI (Recommended)
```bash
cd "C:\Repositories\Projects\executive-flash-news"

# Check if gh CLI is installed
gh --version

# If not installed, download from: https://cli.github.com/

# Create repository on GitHub
gh repo create executive-flash-news --public --description "Executive Flash News Jira Plugin - Transform complex Jira data into executive-friendly flash news"

# Push to GitHub
git branch -M main
git push -u origin main

# Create develop branch
git checkout -b develop
git push -u origin develop
git checkout main
```

### Using GitHub Web Interface (Alternative)
1. Go to https://github.com/new
2. Repository name: `executive-flash-news`
3. Description: "Executive Flash News Jira Plugin - Transform complex Jira data into executive-friendly flash news"
4. Set to Public
5. Click "Create repository"
6. Follow the "push an existing repository" instructions

## Step 2: Configure Forge CLI Authentication (10 minutes)

### Interactive Authentication
```bash
# Authenticate with Atlassian (will open browser)
forge login

# This will:
# 1. Open browser to Atlassian login
# 2. Authenticate with your Atlassian account
# 3. Generate API token automatically
# 4. Store credentials locally

# Verify authentication
forge whoami
```

### Manual Token Configuration (If Interactive Fails)
1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Click "Settings" → "API tokens"
3. Create new token with permissions:
   - `forge:app:read`
   - `forge:app:write`
   - `forge:app:deploy`
   - `forge:app:install`
4. Configure CLI:
```bash
forge login --email your-email@domain.com --token your-api-token
```

## Step 3: Create Forge Application (15 minutes)

### Create New Forge App
```bash
cd "C:\Repositories\Projects\executive-flash-news"

# Register new Forge app
forge register

# App name: executive-flash-news-dev
# This will generate an App ID (save this for GitHub secrets)
```

### Deploy to Development Environment
```bash
# Deploy the app
forge deploy --environment development

# The deploy will fail (expected) because we don't have source code yet
# But it will create the app structure we need
```

## Step 4: Set Up Jira Cloud Instance (10 minutes)

### Option A: Use Existing Jira Cloud Site
If you have a Jira Cloud site:
```bash
# Install the app to your site
forge install --site your-site.atlassian.net --product jira

# Replace 'your-site' with your actual Jira site name
```

### Option B: Create Free Jira Cloud Site
1. Go to https://www.atlassian.com/software/jira/free
2. Sign up for free Jira Cloud site
3. Choose site name (e.g., `executive-flash-news-dev.atlassian.net`)
4. Complete setup with sample data
5. Install app:
```bash
forge install --site executive-flash-news-dev.atlassian.net --product jira
```

## Step 5: Configure GitHub Secrets (10 minutes)

### Required Secrets for Development Environment
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
```bash
# Forge Authentication
FORGE_EMAIL=your-atlassian-email@domain.com
FORGE_API_TOKEN=your-forge-api-token

# Development Environment
FORGE_DEV_APP_ID=your-app-id-from-forge-register
FORGE_DEV_SITE=your-site.atlassian.net
DEV_JIRA_SITE_URL=https://your-site.atlassian.net
```

### Get Your App ID
```bash
# List your Forge apps to get the App ID
forge settings

# Or check the output from when you ran 'forge register'
```

## Step 6: Create GitHub Environments (5 minutes)

### Development Environment
1. Go to repository → Settings → Environments
2. Click "New environment"
3. Name: `development`
4. No protection rules needed
5. Click "Create environment"

## Step 7: Test the CI/CD Pipeline (15 minutes)

### Trigger Pipeline Test
```bash
# Make a small change to test pipeline
cd "C:\Repositories\Projects\executive-flash-news"
git checkout develop

# Add test change
echo "# Pipeline Test" >> README.md
git add README.md
git commit -m "test: trigger CI/CD pipeline validation

- Testing GitHub repository integration
- Validating workflow execution
- E2E tests should fail (expected until environment complete)"

git push origin develop
```

### Monitor Pipeline Execution
1. Go to GitHub repository → Actions tab
2. Watch the "CI/CD Pipeline" workflow execute
3. **Expected Results**:
   - ✅ Build & Test: Should pass
   - ✅ ATDD Validation: Should pass
   - ✅ Security Scan: Should pass
   - ✅ Forge Build: Should pass
   - ❌ Deploy Development: May fail (needs complete secrets)
   - ❌ E2E Tests: Should fail (expected - no real widget yet)

## Step 8: Verify E2E Test Behavior (10 minutes)

### Run E2E Tests Locally
```bash
cd "C:\Repositories\Projects\executive-flash-news"

# Run the E2E tests (should fail as expected)
npm test

# Check that they fail for the RIGHT reasons:
# - "Forge environment not configured"
# - "realWidgetVisible" assertion fails
# This proves our Outside-In TDD is working correctly!
```

## Step 9: Create Minimal Working Widget (30 minutes)

### Create Basic Forge Widget
```bash
# Create src directory structure
mkdir -p src

# Create basic index.js for Forge
cat > src/index.js << 'EOF'
import ForgeUI, { render, Fragment, Text, Strong } from '@forge/ui';

const App = () => {
  return (
    <Fragment>
      <Text>
        <Strong>Welcome to Executive Flash News Plugin</Strong>
      </Text>
      <Text>Version: v1.0.0</Text>
      <Text>Status: Active</Text>
    </Fragment>
  );
};

export const run = render(<App />);
EOF
```

### Deploy and Test
```bash
# Deploy the actual widget
forge deploy --environment development

# Install/update in your Jira site
forge install --site your-site.atlassian.net --product jira --upgrade

# Start tunnel for development
forge tunnel
```

## Step 10: Validate E2E Tests Pass (15 minutes)

### Test Real Widget
1. Go to your Jira Cloud site
2. Navigate to a dashboard
3. Add the "Executive Flash News" widget
4. Verify it displays the welcome message

### Run E2E Tests Again
```bash
# With real environment, E2E tests should now pass
npm run test:e2e

# If they pass, you've successfully implemented Outside-In TDD!
```

## Success Criteria Checklist

- [ ] GitHub repository created and accessible
- [ ] Forge CLI authenticated successfully
- [ ] Forge app registered and deployed
- [ ] Jira Cloud site configured
- [ ] GitHub secrets configured
- [ ] CI/CD pipeline executes successfully
- [ ] E2E tests initially fail (proving they're real)
- [ ] Basic widget deployed and visible in Jira
- [ ] E2E tests pass against real environment

## Troubleshooting

### Common Issues

**Forge CLI Authentication Fails**:
- Try `forge logout` then `forge login` again
- Check your Atlassian account has developer access
- Ensure you're using a supported Node.js version (20.x or 22.x)

**GitHub CLI Not Available**:
- Download from https://cli.github.com/
- Or create repository manually via web interface

**Jira Installation Fails**:
- Ensure you have admin permissions on Jira site
- Try `--upgrade` flag if app already exists
- Check app permissions in Atlassian Developer Console

**CI/CD Pipeline Fails**:
- Verify all required secrets are configured
- Check the specific job that's failing in Actions tab
- Some failures expected until environment fully configured

## Getting Help

- **Forge Documentation**: https://developer.atlassian.com/platform/forge/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Issues**: Create issue in repository for problems

---

**Next**: After completing these steps, your E2E tests should guide you to implement the full Executive Flash News functionality! 🎯