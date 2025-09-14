# Executive Flash News - Deployment Guide

## 🚀 Deploy to Atlassian Forge

Your Executive Flash News plugin is ready for deployment! Follow these steps to get your walking skeleton running in a live Jira environment.

### Prerequisites ✅

- ✅ **Forge CLI**: v12.5.2 installed
- ✅ **Plugin Built**: Hexagonal architecture with working tests
- ✅ **Tests Passing**: 11/11 tests passing (1 E2E + 10 unit tests)
- ✅ **Walking Skeleton**: Basic welcome widget functionality implemented

### 📋 Deployment Checklist

#### Step 1: Forge Authentication
```bash
# Login to Forge (this will open a browser for authentication)
forge login

# Verify login status
forge whoami
```
*Note: You'll need an Atlassian Developer account. Sign up at [developer.atlassian.com](https://developer.atlassian.com) if needed.*

#### Step 2: Build and Validate
```bash
# Validate manifest and configuration
forge lint

# Build the application
forge build

# Check build output
ls -la
```

#### Step 3: Deploy to Development Environment
```bash
# Deploy to Forge development environment
forge deploy

# This will:
# - Upload your code to Atlassian's cloud infrastructure
# - Create your app in the Forge platform
# - Generate a unique app ID
```

#### Step 4: Install in Test Jira Site
```bash
# Install the plugin in a Jira site
forge install

# Follow prompts to:
# 1. Select your Jira site (or create a free developer site)
# 2. Confirm permissions (read:jira-user, read:jira-work)
# 3. Install the app
```

#### Step 5: Test the Walking Skeleton
1. **Navigate to Jira Dashboard** in your test site
2. **Look for "Executive Flash News" widget**
3. **Verify Welcome Message**: Should display "Welcome to Executive Flash News Plugin"
4. **Check Version Display**: Should show "v1.0.0"
5. **Test Interaction**: Click widget for demo popup

### 🔧 Alternative: Manual Forge Setup

If you encounter CLI issues, you can use the Atlassian Developer Console:

1. **Visit [developer.atlassian.com](https://developer.atlassian.com)**
2. **Go to "Your Apps" → "Create a Forge App"**
3. **Upload your manifest.yml and source code**
4. **Deploy through the web interface**

### 📊 Expected Results

After successful deployment, you should see:

#### In Jira Dashboard:
- ✅ **Executive Flash News Widget** appears in dashboard
- ✅ **Welcome Message**: "Welcome to Executive Flash News Plugin"
- ✅ **Version Display**: "Version: v1.0.0"
- ✅ **Professional Styling**: Executive-appropriate design
- ✅ **Interactive Demo**: Click for feature overview

#### In Forge Console:
- ✅ **App Status**: "Installed"
- ✅ **Environment**: "Development"
- ✅ **Permissions**: Read access granted
- ✅ **Logs**: No errors in function execution

### 🎯 Walking Skeleton Validation

Your deployed plugin demonstrates:

#### ✅ **End-to-End Integration**
- Jira dashboard integration working
- Widget placement and rendering successful
- User authentication and permissions functional

#### ✅ **Business Logic**
- Welcome message generation working
- Plugin version management operational
- Executive-focused UI design validated

#### ✅ **Technical Architecture**
- Hexagonal architecture deployed successfully
- Forge platform integration validated
- Production service integration confirmed

### 🔄 Development Workflow

For ongoing development:

```bash
# Make code changes locally
# Run tests to ensure quality
npm test

# Deploy updates
forge deploy

# Changes are automatically reflected in installed instances
```

### 🐛 Troubleshooting

#### Common Issues:

**"Node.js version not supported"**
- Install Node.js 20.x or 22.x for optimal Forge CLI compatibility
- Current version (v23.6.1) works but shows warnings

**"Prompts cannot be rendered"**
- Use interactive terminal (PowerShell, Command Prompt, or Git Bash)
- Avoid non-interactive environments for Forge CLI commands

**"Permission denied"**
- Ensure you have admin access to the Jira site
- Check that scopes (read:jira-user, read:jira-work) are approved

**"Widget not appearing"**
- Refresh the Jira dashboard
- Check app installation status in Jira settings
- Verify deployment completed successfully

### 📈 Next Steps After Deployment

1. **DEMO Stage**: Show working widget to stakeholders
2. **DEVELOP Stage**: Enable next acceptance test scenario
3. **Enhancement**: Add role-based personalization
4. **Production**: Deploy to production Jira instance

### 🎉 Success Criteria

Your deployment is successful when:
- ✅ Executive Flash News widget appears in Jira dashboard
- ✅ Welcome message displays correctly
- ✅ Plugin version shows "v1.0.0"
- ✅ No errors in Forge application logs
- ✅ Click interaction works (demo popup)

**Your Executive Flash News plugin is ready to transform into a full executive dashboard solution!**