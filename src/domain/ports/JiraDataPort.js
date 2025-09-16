/**
 * Jira Data Port Interface
 * Defines the contract for accessing Jira project data
 */
export class JiraDataPort {
  /**
   * Retrieve projects accessible to the current executive user
   * @returns {Promise<Array>} Array of project data
   */
  async getExecutiveProjects() {
    throw new Error('JiraDataPort.getExecutiveProjects() must be implemented');
  }

  /**
   * Get project health metrics for a specific project
   * @param {string} projectKey - Jira project key
   * @returns {Promise<Object>} Project health data
   */
  async getProjectHealthMetrics(projectKey) {
    throw new Error('JiraDataPort.getProjectHealthMetrics() must be implemented');
  }

  /**
   * Get current user information
   * @returns {Promise<Object>} User profile data
   */
  async getCurrentUser() {
    throw new Error('JiraDataPort.getCurrentUser() must be implemented');
  }
}