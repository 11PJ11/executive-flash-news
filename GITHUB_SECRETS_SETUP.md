# GitHub Secrets Configuration Guide

## Production-Only Setup

Since we only have access to the production Jira site (https://executive-flash-news.atlassian.net), this guide configures GitHub secrets for a single-environment deployment using trunk-based development.

## Required Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions

### 🔑 Core Forge Authentication
```
FORGE_EMAIL
```
- **Value**: Your Atlassian account email
- **Used for**: Forge CLI authentication across all operations

```
FORGE_API_TOKEN
```
- **Value**: Your Forge API token from Atlassian Developer Console
- **Used for**: Forge CLI authentication and deployment
- **How to get**: Go to [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/) → Settings → API tokens

### 🚀 Production Environment Configuration
```
FORGE_PROD_APP_ID
```
- **Value**: Your Forge application ID from `forge register`
- **Used for**: Production deployment targeting
- **How to get**: Run `forge list` or check output from `forge register`

```
FORGE_PROD_SITE
```
- **Value**: `executive-flash-news.atlassian.net`
- **Used for**: Forge app installation target site
- **Format**: Domain only, no https:// prefix

```
PROD_JIRA_SITE_URL
```
- **Value**: `https://executive-flash-news.atlassian.net`
- **Used for**: E2E test environment configuration
- **Format**: Full URL with https:// prefix

### 📢 Optional Notification Secrets
```
SLACK_WEBHOOK_URL
```
- **Value**: Your Slack webhook URL for CI/CD notifications
- **Optional**: Leave empty to disable Slack notifications

```
TEAMS_WEBHOOK_URL
```
- **Value**: Your Microsoft Teams webhook URL for CI/CD notifications
- **Optional**: Leave empty to disable Teams notifications

## Secret Values Summary

| Secret Name | Example Value | Required |
|-------------|---------------|----------|
| `FORGE_EMAIL` | `your-email@domain.com` | ✅ Yes |
| `FORGE_API_TOKEN` | `ATT...` (from Atlassian) | ✅ Yes |
| `FORGE_PROD_APP_ID` | `ari:cloud:ecosystem::app/...` | ✅ Yes |
| `FORGE_PROD_SITE` | `executive-flash-news.atlassian.net` | ✅ Yes |
| `PROD_JIRA_SITE_URL` | `https://executive-flash-news.atlassian.net` | ✅ Yes |
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/...` | ❌ Optional |
| `TEAMS_WEBHOOK_URL` | `https://outlook.office.com/...` | ❌ Optional |

## CI/CD Pipeline Flow

With trunk-based development, the pipeline triggers on every push to `main`:

1. **🔧 Build & Test** - Code quality, unit tests, linting
2. **🎯 ATDD Validation** - Acceptance test compliance
3. **🔒 Security Scan** - NPM audit and CodeQL analysis
4. **⚡ Forge Build** - Validate Forge manifest and build
5. **🚀 Deploy to Production** - Direct deployment to production environment
6. **🧪 Integration Tests** - E2E tests against deployed application
7. **🏥 Health Check** - Application health verification
8. **📢 Notifications** - Success/failure notifications

## Environment Strategy

**Trunk-Based Development Approach:**
- All commits go to `main` branch
- No feature branches or pull requests
- Direct deployment to production
- ATDD with real E2E tests validates before deployment
- Fast feedback loop with continuous integration

**Single Environment Benefits:**
- Simplified configuration
- Faster deployment cycles
- Reduced complexity
- Lower maintenance overhead
- Aligned with continuous delivery principles

## Next Steps

1. **Configure All Required Secrets** in GitHub repository settings
2. **Push to Main Branch** to trigger the first pipeline run
3. **Monitor Pipeline Execution** in GitHub Actions tab
4. **Validate Application** deployment at https://executive-flash-news.atlassian.net

## Troubleshooting

### Common Issues

**Forge Authentication Fails:**
- Verify `FORGE_EMAIL` and `FORGE_API_TOKEN` are correct
- Check token permissions in Atlassian Developer Console
- Ensure token hasn't expired

**App Deployment Fails:**
- Verify `FORGE_PROD_APP_ID` matches your registered app
- Check `FORGE_PROD_SITE` is the correct domain
- Ensure you have admin permissions on Jira site

**E2E Tests Fail:**
- Verify `PROD_JIRA_SITE_URL` is correct and accessible
- Check that application deployed successfully
- Ensure E2E tests have proper wait conditions

**Pipeline Doesn't Trigger:**
- Ensure you're pushing to `main` branch (trunk-based development)
- Check GitHub Actions is enabled for the repository
- Verify workflow file syntax is correct

### Getting Help

- **Forge CLI Issues**: [Atlassian Forge Documentation](https://developer.atlassian.com/platform/forge/)
- **GitHub Actions**: [GitHub Actions Documentation](https://docs.github.com/en/actions)
- **ATDD Approach**: Check `tests/acceptance/` for example test patterns