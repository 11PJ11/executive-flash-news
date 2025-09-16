/**
 * Executive Portfolio Domain Entity
 * Core business logic for executive portfolio health tracking
 */
export class ExecutivePortfolio {
  constructor(executiveId, portfolioData) {
    this.executiveId = executiveId;
    this.projects = portfolioData.projects || [];
    this.lastUpdated = new Date();
  }

  calculateHealthScore() {
    if (this.projects.length === 0) return 0;

    const totalScore = this.projects.reduce((sum, project) => {
      return sum + this._calculateProjectHealth(project);
    }, 0);

    return Math.round(totalScore / this.projects.length);
  }

  getCriticalAlerts() {
    return this.projects
      .filter(project => this._isProjectCritical(project))
      .map(project => ({
        projectKey: project.key,
        projectName: project.name,
        alertLevel: 'CRITICAL',
        reason: this._getCriticalReason(project)
      }));
  }

  getPortfolioSummary() {
    return {
      totalProjects: this.projects.length,
      healthScore: this.calculateHealthScore(),
      criticalAlerts: this.getCriticalAlerts().length,
      onTrackProjects: this.projects.filter(p => this._calculateProjectHealth(p) >= 70).length,
      atRiskProjects: this.projects.filter(p => this._calculateProjectHealth(p) < 70).length
    };
  }

  _calculateProjectHealth(project) {
    // Business logic for project health calculation
    let score = 100;

    // Deduct points for overdue issues
    if (project.overdueIssues > 0) {
      score -= Math.min(30, project.overdueIssues * 5);
    }

    // Deduct points for blocked issues
    if (project.blockedIssues > 0) {
      score -= Math.min(20, project.blockedIssues * 3);
    }

    // Deduct points for high priority unresolved issues
    if (project.highPriorityIssues > 0) {
      score -= Math.min(25, project.highPriorityIssues * 2);
    }

    return Math.max(0, score);
  }

  _isProjectCritical(project) {
    return this._calculateProjectHealth(project) < 50 ||
           project.overdueIssues > 5 ||
           project.blockedIssues > 3;
  }

  _getCriticalReason(project) {
    if (project.overdueIssues > 5) return `${project.overdueIssues} overdue issues`;
    if (project.blockedIssues > 3) return `${project.blockedIssues} blocked issues`;
    if (this._calculateProjectHealth(project) < 50) return 'Overall health below 50%';
    return 'Multiple risk factors';
  }
}