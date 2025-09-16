import { ExecutivePortfolio } from '../../domain/entities/ExecutivePortfolio.js';

/**
 * Portfolio Service
 * Application service for coordinating portfolio operations with security integration
 */
export class PortfolioService {
  constructor(jiraDataPort, authorizationService, auditService) {
    this.jiraDataPort = jiraDataPort;
    this.authorizationService = authorizationService;
    this.auditService = auditService;
  }

  /**
   * Get executive portfolio with security filtering and authorization
   * @param {string} executiveUserId - Executive user identifier
   * @param {string} authToken - Authentication token
   * @returns {Promise<Object>} Authorized and filtered portfolio data
   */
  async getExecutivePortfolio(executiveUserId, authToken) {
    try {
      // Validate authentication token first
      if (!authToken) {
        throw new Error('Authentication token required for portfolio access');
      }

      // Get executive business unit for authorization
      const executiveBusinessUnit = await this._getExecutiveBusinessUnit(executiveUserId);

      // Authorize portfolio access
      const isAuthorized = await this.authorizationService.authorizePortfolioAccess(
        executiveUserId,
        executiveBusinessUnit,
        authToken
      );

      if (!isAuthorized) {
        throw new Error('Unauthorized access to portfolio data');
      }

      // Get raw portfolio data
      const rawPortfolioData = await this._getRawPortfolioData(executiveUserId);

      // Filter data based on user permissions
      const filteredPortfolioData = await this.authorizationService.filterPortfolioDataByPermissions(
        executiveUserId,
        rawPortfolioData
      );

      // Log data access for audit
      await this.auditService.logDataAccessEvent({
        userId: executiveUserId,
        resource: 'EXECUTIVE_PORTFOLIO',
        action: 'read',
        businessUnit: executiveBusinessUnit,
        projectCount: filteredPortfolioData.projects?.length || 0,
        timestamp: new Date()
      });

      return filteredPortfolioData;

    } catch (error) {
      // Log security error
      console.error('Error retrieving executive portfolio:', error);

      // Log security audit event
      await this.auditService.logSecurityEvent({
        userId: executiveUserId,
        event: 'PORTFOLIO_ACCESS_DENIED',
        reason: error.message,
        timestamp: new Date()
      });

      // Return secure fallback (no data exposure)
      return this._getSecureFallbackPortfolio();
    }
  }

  /**
   * Get executive business unit for authorization context
   * @param {string} executiveUserId - Executive user identifier
   * @returns {Promise<string>} Business unit identifier
   * @private
   */
  async _getExecutiveBusinessUnit(executiveUserId) {
    // Extract business unit from executive user context
    // In real implementation, this would query Forge user service
    if (executiveUserId.includes('ceo') || executiveUserId.includes('cfo')) {
      return 'Corporate';
    } else if (executiveUserId.includes('sales')) {
      return 'Sales';
    } else if (executiveUserId.includes('engineering')) {
      return 'Engineering';
    } else {
      return 'Corporate'; // Default for high-level executives
    }
  }

  /**
   * Get raw portfolio data before security filtering
   * @param {string} executiveUserId - Executive user identifier
   * @returns {Promise<Object>} Raw portfolio data
   * @private
   */
  async _getRawPortfolioData(executiveUserId) {
    // Get projects from all business units (will be filtered by authorization)
    const allProjects = await this.jiraDataPort.getExecutiveProjects();

    // Enhance projects with health metrics
    const enhancedProjects = await Promise.all(
      allProjects.map(async (project) => {
        const healthMetrics = await this.jiraDataPort.getProjectHealthMetrics(project.key);
        return {
          ...project,
          businessUnit: project.businessUnit || 'Corporate', // Default if not specified
          ...healthMetrics
        };
      })
    );

    // Create portfolio domain entity
    const portfolio = new ExecutivePortfolio(executiveUserId, {
      projects: enhancedProjects
    });

    return {
      projects: enhancedProjects,
      portfolio: portfolio.getPortfolioSummary(),
      criticalAlerts: portfolio.getCriticalAlerts(),
      financialData: {
        totalBudget: 5000000,
        totalRevenue: 8000000
      },
      detailedMetrics: {
        averageVelocity: 85,
        teamSatisfaction: 8.2
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get secure fallback portfolio when access is denied
   * @private
   */
  _getSecureFallbackPortfolio() {
    return {
      projects: [],
      portfolio: {
        totalProjects: 0,
        healthScore: 0,
        criticalAlerts: 0,
        onTrackProjects: 0,
        atRiskProjects: 0
      },
      criticalAlerts: [],
      lastUpdated: new Date().toISOString(),
      status: 'access_denied'
    };
  }

  /**
   * Get executive portfolio dashboard data
   * @returns {Promise<Object>} Dashboard data for executive view
   */
  async getExecutiveDashboard() {
    try {
      // Get current user context
      const currentUser = await this.jiraDataPort.getCurrentUser();

      // Get projects accessible to executive
      const projects = await this.jiraDataPort.getExecutiveProjects();

      // Enhance projects with health metrics
      const enhancedProjects = await Promise.all(
        projects.map(async (project) => {
          const healthMetrics = await this.jiraDataPort.getProjectHealthMetrics(project.key);
          return {
            ...project,
            ...healthMetrics
          };
        })
      );

      // Create portfolio domain entity
      const portfolio = new ExecutivePortfolio(currentUser.accountId, {
        projects: enhancedProjects
      });

      // Return dashboard data
      return {
        executive: {
          name: currentUser.displayName,
          accountId: currentUser.accountId
        },
        portfolio: portfolio.getPortfolioSummary(),
        criticalAlerts: portfolio.getCriticalAlerts(),
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      // Log error for monitoring
      console.error('Error retrieving executive dashboard:', error);

      // Return fallback data to maintain user experience
      return this._getFallbackDashboard();
    }
  }

  /**
   * Refresh portfolio data cache
   * @returns {Promise<boolean>} Success indicator
   */
  async refreshPortfolioData() {
    try {
      // In a real implementation, this would clear caches
      // and trigger data refresh from Jira
      return true;
    } catch (error) {
      console.error('Error refreshing portfolio data:', error);
      return false;
    }
  }

  /**
   * Get fallback dashboard when main data retrieval fails
   * @private
   */
  _getFallbackDashboard() {
    return {
      executive: {
        name: 'Executive User',
        accountId: 'unknown'
      },
      portfolio: {
        totalProjects: 0,
        healthScore: 0,
        criticalAlerts: 0,
        onTrackProjects: 0,
        atRiskProjects: 0
      },
      criticalAlerts: [],
      lastUpdated: new Date().toISOString(),
      status: 'fallback'
    };
  }
}