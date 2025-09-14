# GitHub Repository Setup Guide

## Prerequisites
- GitHub account with repository creation permissions
- Forge developer account and API access
- Jira Cloud instances for development, staging, and production

## Repository Setup Steps

### 1. Create GitHub Repository
```bash
# Navigate to project directory
cd C:\Repositories\Projects\executive-flash-news

# Add all files to staging
git add .

# Initial commit
git commit -m "Initial commit: Executive Flash News Jira plugin with CI/CD pipeline

✨ Features:
- Real E2E acceptance tests requiring Forge environment
- Comprehensive CI/CD pipeline with quality gates
- Multi-environment deployment (dev/staging/production)
- ATDD compliance validation
- Security scanning and code quality analysis

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Create repository on GitHub (replace YOUR_USERNAME with your GitHub username)
gh repo create executive-flash-news --public --description "Executive Flash News Jira Plugin - Transform complex Jira data into executive-friendly flash news"

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2. Create GitHub Environments

Navigate to your repository on GitHub and create the following environments:

#### Development Environment
- **Settings** → **Environments** → **New environment**: `development`
- **Deployment protection rules**: None (auto-deploy on `develop` branch)
- **Environment secrets**: Configure development-specific secrets

#### Staging Environment
- **Settings** → **Environments** → **New environment**: `staging`
- **Deployment protection rules**: None (auto-deploy on `main` branch)
- **Environment secrets**: Configure staging-specific secrets

#### Production Environment
- **Settings** → **Environments** → **New environment**: `production`
- **Deployment protection rules**:
  - ✅ Required reviewers (add team leads)
  - ✅ Wait timer: 5 minutes
  - ✅ Restrict pushes that create the deployment
- **Environment secrets**: Configure production-specific secrets

### 3. Configure GitHub Secrets

#### Required Repository Secrets
Navigate to **Settings** → **Secrets and variables** → **Actions**

##### Forge Authentication
```bash
FORGE_EMAIL=your-atlassian-email@domain.com
FORGE_API_TOKEN=your-forge-api-token
```

##### Development Environment
```bash
FORGE_DEV_APP_ID=your-development-app-id
FORGE_DEV_SITE=your-dev-site.atlassian.net
DEV_JIRA_SITE_URL=https://your-dev-site.atlassian.net
```

##### Staging Environment
```bash
FORGE_STAGING_APP_ID=your-staging-app-id
FORGE_STAGING_SITE=your-staging-site.atlassian.net
STAGING_JIRA_SITE_URL=https://your-staging-site.atlassian.net
```

##### Production Environment
```bash
FORGE_PROD_APP_ID=your-production-app-id
FORGE_PROD_SITE=your-prod-site.atlassian.net
PROD_JIRA_SITE_URL=https://your-prod-site.atlassian.net
```

##### Optional Integration Secrets
```bash
SONAR_TOKEN=your-sonarcloud-token
FOSSA_API_KEY=your-fossa-api-key
CODECOV_TOKEN=your-codecov-token
SLACK_WEBHOOK_URL=your-slack-webhook-url
TEAMS_WEBHOOK_URL=your-teams-webhook-url
```

### 4. Generate Forge API Token

1. Log in to [Atlassian Developer Console](https://developer.atlassian.com/)
2. Go to **Settings** → **API tokens**
3. Create a new API token with the following permissions:
   - `forge:app:read`
   - `forge:app:write`
   - `forge:app:deploy`
   - `forge:app:install`
4. Copy the token and add it as `FORGE_API_TOKEN` secret

### 5. Setup Branch Protection Rules

Navigate to **Settings** → **Branches** and add protection rules:

#### Main Branch Protection
- **Branch name pattern**: `main`
- **Restrictions**:
  - ✅ Require pull request reviews before merging
  - ✅ Require status checks to pass before merging
  - ✅ Required status checks:
    - `build-and-test`
    - `atdd-validation`
    - `security-scan`
    - `forge-build`
  - ✅ Require branches to be up to date before merging
  - ✅ Restrict pushes that create and delete matching branches

#### Develop Branch Protection
- **Branch name pattern**: `develop`
- **Restrictions**:
  - ✅ Require status checks to pass before merging
  - ✅ Required status checks:
    - `build-and-test`
    - `security-scan`

### 6. Test CI/CD Pipeline

#### Initial Pipeline Test
```bash
# Create develop branch
git checkout -b develop
git push -u origin develop

# Make a test change
echo "# Test Change" >> README.md
git add README.md
git commit -m "test: verify CI/CD pipeline functionality"
git push

# Check GitHub Actions tab for pipeline execution
```

#### Manual Deployment Test
1. Go to **Actions** tab in GitHub
2. Select **Forge Validation** workflow
3. Click **Run workflow**
4. Select environment: `development`
5. Monitor execution and logs

### 7. Configure SonarCloud (Optional)

1. Visit [SonarCloud](https://sonarcloud.io/)
2. Connect your GitHub repository
3. Configure project analysis
4. Copy the token to `SONAR_TOKEN` secret
5. Update `sonar-project.properties` with your organization

### 8. Setup Notifications (Optional)

#### Slack Integration
1. Create a Slack webhook in your workspace
2. Add webhook URL as `SLACK_WEBHOOK_URL` secret
3. Configure channel in workflow files

#### Microsoft Teams Integration
1. Create Teams webhook in your channel
2. Add webhook URL as `TEAMS_WEBHOOK_URL` secret

## Verification Checklist

- [ ] Repository created and code pushed
- [ ] All three environments configured (dev/staging/prod)
- [ ] All required secrets configured
- [ ] Branch protection rules active
- [ ] CI/CD pipeline executes successfully on push
- [ ] Manual deployment workflows functional
- [ ] Notifications configured (if desired)
- [ ] E2E tests fail appropriately (until Forge environment setup)

## Next Steps

After completing GitHub setup:

1. **Create Forge Applications**: Set up separate apps for each environment
2. **Configure Jira Sites**: Ensure access to development, staging, and production Jira instances
3. **Test E2E Pipeline**: Run full deployment pipeline to verify environment connectivity
4. **Setup Monitoring**: Configure application monitoring and alerting

## Troubleshooting

### Common Issues

#### Pipeline Fails with Forge Authentication
- Verify `FORGE_EMAIL` and `FORGE_API_TOKEN` are correct
- Check token permissions in Atlassian Developer Console
- Ensure API token has not expired

#### Deployment Fails
- Verify environment-specific app IDs are correct
- Check Jira site URLs are accessible
- Ensure Forge app is registered for the target environment

#### Tests Timeout
- E2E tests are expected to fail until Forge environment is fully configured
- Unit tests should pass - investigate specific test failures
- Check test timeout settings in pipeline configuration

### Getting Help

- **Forge Documentation**: [Atlassian Forge Docs](https://developer.atlassian.com/platform/forge/)
- **GitHub Actions**: [GitHub Actions Documentation](https://docs.github.com/en/actions)
- **CI/CD Issues**: Check repository Issues tab or create new issue