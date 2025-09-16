import { PortfolioService } from '../../application/services/PortfolioService.js';
import { ForgeJiraAdapter } from '../../infrastructure/adapters/ForgeJiraAdapter.js';

/**
 * Dashboard Resolver
 * Presentation layer resolver for executive dashboard
 */
export class DashboardResolver {
  constructor() {
    // Initialize infrastructure adapters
    this.jiraAdapter = new ForgeJiraAdapter();

    // Initialize application services with dependency injection
    this.portfolioService = new PortfolioService(this.jiraAdapter);
  }

  /**
   * Resolve executive dashboard data
   * @returns {Promise<Object>} Dashboard data for UI rendering
   */
  async resolveDashboard() {
    try {
      const startTime = Date.now();

      // Get portfolio dashboard data from application service
      const dashboardData = await this.portfolioService.getExecutiveDashboard();

      // Add performance metrics for monitoring
      const responseTime = Date.now() - startTime;

      return {
        ...dashboardData,
        performance: {
          responseTimeMs: responseTime,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Dashboard resolver error:', error);

      // Return error state for UI handling
      return {
        error: {
          message: 'Unable to load dashboard data',
          details: error.message,
          timestamp: new Date().toISOString()
        },
        portfolio: {
          totalProjects: 0,
          healthScore: 0,
          criticalAlerts: 0,
          onTrackProjects: 0,
          atRiskProjects: 0
        },
        criticalAlerts: []
      };
    }
  }

  /**
   * Handle dashboard refresh requests
   * @returns {Promise<Object>} Refresh status
   */
  async handleRefresh() {
    try {
      const success = await this.portfolioService.refreshPortfolioData();

      if (success) {
        const updatedData = await this.resolveDashboard();
        return {
          success: true,
          data: updatedData,
          message: 'Dashboard refreshed successfully'
        };
      } else {
        return {
          success: false,
          message: 'Failed to refresh dashboard data'
        };
      }

    } catch (error) {
      console.error('Dashboard refresh error:', error);
      return {
        success: false,
        message: 'Error during dashboard refresh',
        error: error.message
      };
    }
  }
}