# CI/CD Operations Runbook

Operational runbook for Executive Flash News CI/CD pipeline management, troubleshooting, and incident response.

## 🚨 Emergency Procedures

### Critical Deployment Failure

**Immediate Actions (0-5 minutes):**
1. Check pipeline status in GitHub Actions
2. Review latest commit changes
3. Check health monitoring dashboard
4. Assess user impact

**Response Actions (5-15 minutes):**
1. Execute emergency rollback if needed:
   ```bash
   # Navigate to GitHub Actions
   # Run "Emergency Rollback" workflow
   # Select environment and provide reason
   ```
2. Create incident issue
3. Notify stakeholders via Slack/Teams
4. Document timeline and impact

### Production Health Alerts

**Assessment Steps:**
1. Run manual health check:
   ```bash
   node scripts/deployment-monitor.js health-check production
   ```
2. Check recent deployments
3. Review monitoring metrics
4. Verify third-party service status

**Response Based on Severity:**
- **P0 (Critical)**: Immediate rollback
- **P1 (High)**: Hot fix deployment
- **P2 (Medium)**: Schedule fix in next deployment
- **P3 (Low)**: Add to backlog

## 🔧 Operational Procedures

### Daily Operations Checklist

**Morning Checklist:**
- [ ] Review overnight pipeline runs
- [ ] Check production health status
- [ ] Verify no failed deployments
- [ ] Review security alerts
- [ ] Check dependency vulnerability reports

**Weekly Checklist:**
- [ ] Review pipeline performance metrics
- [ ] Update dependencies with security patches
- [ ] Rotate development environment data
- [ ] Review and update documentation
- [ ] Conduct pipeline performance review

### Deployment Process

#### Standard Deployment Flow

1. **Feature Development**
   ```bash
   # Create feature branch
   git checkout -b feature/your-feature

   # Develop with ATDD
   npm run test:e2e  # Start with E2E test
   npm run test:unit # Implement unit tests

   # Quality checks
   npm run quality-gates
   ```

2. **Pull Request Process**
   - Open PR against `develop`
   - Ensure all PR checks pass
   - Get code review approval
   - Merge to `develop`

3. **Development Deployment**
   - Auto-triggered on `develop` merge
   - Monitor health checks
   - Verify functionality

4. **Staging Deployment**
   - Merge `develop` to `main`
   - Auto-deployment to staging
   - Full regression testing

5. **Production Release**
   - Create release from `main`
   - Auto-deployment to production
   - Monitor for 24 hours

### Environment Management

#### Environment Refresh

**Development Environment:**
```bash
# Refresh development with latest data
forge deploy --environment development --no-prompt

# Verify health
node scripts/deployment-monitor.js health-check development
```

**Staging Environment:**
```bash
# Deploy to staging
forge deploy --environment staging --no-prompt

# Run full test suite
npm run test:coverage
npm run test:e2e
```

#### Environment Troubleshooting

**Common Issues:**

1. **App Not Responding**
   ```bash
   # Check Forge logs
   forge logs --environment production

   # Verify installation
   forge install --site your-site --product jira
   ```

2. **Permission Issues**
   ```bash
   # Check app permissions
   forge whoami

   # Verify site access
   forge sites
   ```

3. **Build Failures**
   ```bash
   # Clean build
   rm -rf node_modules dist
   npm ci
   npm run build
   ```

## 📊 Monitoring & Alerting

### Key Metrics to Monitor

#### Deployment Metrics
- **Deployment frequency**: Target 2-3 per week
- **Lead time**: Commit to production <4 hours
- **MTTR**: Mean time to recovery <30 minutes
- **Change failure rate**: <5%

#### Application Metrics
- **Response time**: <500ms average
- **Error rate**: <1%
- **Availability**: >99.9%
- **User satisfaction**: Monitor Jira feedback

### Alert Response Procedures

#### High Priority Alerts

**Production Down:**
1. Acknowledge alert immediately
2. Run emergency rollback
3. Create incident channel
4. Notify stakeholders
5. Begin investigation

**High Error Rate:**
1. Check recent deployments
2. Review error logs
3. Assess user impact
4. Determine if rollback needed

#### Medium Priority Alerts

**Slow Response Time:**
1. Check performance monitoring
2. Review recent changes
3. Optimize if needed
4. Schedule performance review

**Security Vulnerability:**
1. Assess severity (CVSS score)
2. Check if exploitable
3. Plan patching timeline
4. Communicate to security team

## 🔐 Security Operations

### Security Incident Response

**Potential Security Breach:**
1. **Immediate Response (0-15 minutes)**
   - Isolate affected systems
   - Preserve evidence
   - Assess scope of breach
   - Notify security team

2. **Investigation (15 minutes - 4 hours)**
   - Analyze logs and artifacts
   - Determine attack vector
   - Assess data exposure
   - Document findings

3. **Recovery (4-24 hours)**
   - Apply security patches
   - Reset compromised credentials
   - Deploy fixed version
   - Verify security posture

### Credential Management

**Regular Rotation Schedule:**
- **Forge API tokens**: Every 90 days
- **GitHub tokens**: Every 90 days
- **Webhook URLs**: As needed
- **Service account passwords**: Every 60 days

**Rotation Procedure:**
```bash
# 1. Generate new credentials in source system
# 2. Update GitHub secrets
# 3. Test with non-critical deployment
# 4. Verify all services working
# 5. Deactivate old credentials
```

## 🧪 Testing Operations

### Test Environment Management

#### Test Data Management
```bash
# Reset development data
npm run reset-dev-data

# Load test fixtures
npm run load-test-data

# Verify test environment
npm run test:e2e --env development
```

#### Test Execution Strategies

**Pull Request Testing:**
- Incremental testing (changed files only)
- Fast feedback loop (<5 minutes)
- Security and quality gates

**Pre-deployment Testing:**
- Full test suite execution
- ATDD compliance validation
- Security scanning
- Performance benchmarking

**Post-deployment Testing:**
- Smoke tests
- Health checks
- User journey validation
- Performance monitoring

### Test Failure Investigation

**Test Failure Triage:**
1. **Determine failure type**
   - Code regression
   - Test flakiness
   - Environment issue
   - Data dependency

2. **Immediate actions**
   - Block broken feature from production
   - Create bug ticket
   - Assign to appropriate team member

3. **Resolution process**
   - Fix root cause
   - Add regression tests
   - Update test documentation
   - Review test stability

## 📈 Performance Operations

### Performance Monitoring

**Key Performance Indicators:**
- Bundle size tracking
- Load time monitoring
- Memory usage analysis
- API response times

**Performance Budget Enforcement:**
```bash
# Check bundle sizes
npm run build
npm run analyze-bundle

# Performance testing
npm run test:performance

# Monitor production metrics
node scripts/deployment-monitor.js monitor production
```

### Performance Issue Response

**Performance Degradation:**
1. **Identify bottleneck**
   - Check monitoring dashboards
   - Analyze recent changes
   - Profile application performance

2. **Quick wins**
   - Enable caching
   - Optimize database queries
   - Compress assets

3. **Long-term optimization**
   - Code splitting
   - Lazy loading
   - Infrastructure scaling

## 🔄 Continuous Improvement

### Process Improvement

#### Monthly Review Agenda
1. **Pipeline Performance**
   - Execution times
   - Success rates
   - Bottleneck identification

2. **Quality Metrics**
   - Test coverage trends
   - Bug escape rate
   - Security vulnerability resolution time

3. **Team Feedback**
   - Developer experience surveys
   - Pain point identification
   - Process optimization suggestions

#### Automation Opportunities

**Identify Tasks for Automation:**
- Manual testing steps
- Repetitive deployment tasks
- Report generation
- Compliance checking

**Implementation Process:**
1. Document current manual process
2. Design automation approach
3. Implement in development environment
4. Test thoroughly
5. Deploy to production

### Knowledge Management

#### Documentation Updates
- Keep runbooks current with process changes
- Update troubleshooting guides with new solutions
- Maintain architecture decision records
- Document lessons learned from incidents

#### Training and Onboarding
- New team member CI/CD orientation
- Regular team training on new tools
- Cross-training for bus factor mitigation
- External training and certification

## 📋 Checklists

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Security scan clean
- [ ] Performance benchmarks met
- [ ] Rollback plan prepared
- [ ] Monitoring alerts configured
- [ ] Stakeholders notified

### Post-Deployment Checklist
- [ ] Health checks passing
- [ ] Monitoring dashboards green
- [ ] User acceptance testing complete
- [ ] Performance metrics within targets
- [ ] Error rates normal
- [ ] Documentation updated

### Incident Response Checklist
- [ ] Incident acknowledged
- [ ] Severity assessed
- [ ] Response team assembled
- [ ] Communications plan activated
- [ ] Recovery actions initiated
- [ ] Progress communicated
- [ ] Resolution verified
- [ ] Post-mortem scheduled

## 📞 Contact Information

### Escalation Matrix

**Level 1 - Development Team**
- Initial response and investigation
- Standard deployments and fixes

**Level 2 - Senior Engineers**
- Complex technical issues
- Architecture decisions
- Security incidents

**Level 3 - Leadership**
- Business impact assessment
- Resource allocation decisions
- External communications

### Emergency Contacts
- **Development Team Lead**: [Contact info]
- **DevOps Engineer**: [Contact info]
- **Security Team**: [Contact info]
- **Product Manager**: [Contact info]
- **On-call Engineer**: [Contact info]

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Forge Platform Documentation](https://developer.atlassian.com/platform/forge/)
- [Incident Response Playbook](./INCIDENT-RESPONSE.md)
- [Security Guidelines](./SECURITY.md)
- [Performance Optimization Guide](./PERFORMANCE.md)