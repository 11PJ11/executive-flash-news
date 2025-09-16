import api, { route } from '@forge/api';

/**
 * Forge Jira Adapter
 * Infrastructure adapter for accessing Jira data through Forge platform
 */
export class ForgeJiraAdapter {
  constructor() {
    this.apiClient = api;
  }

  /**
   * Get projects accessible to current user
   * @returns {Promise<Array>} Array of project data
   */
  async getExecutiveProjects() {
    try {
      const response = await this.apiClient.asUser().requestJira(route`/rest/api/3/project/search`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Jira API error: ${data.message || response.statusText}`);
      }

      return data.values.map(project => ({
        key: project.key,
        name: project.name,
        id: project.id,
        projectTypeKey: project.projectTypeKey,
        leadAccountId: project.lead?.accountId,
        description: project.description || ''
      }));

    } catch (error) {
      console.error('Error fetching executive projects:', error);
      // Return empty array as fallback
      return [];
    }
  }

  /**
   * Get project health metrics for a specific project
   * @param {string} projectKey - Jira project key
   * @returns {Promise<Object>} Project health data
   */
  async getProjectHealthMetrics(projectKey) {
    try {
      // Get issue statistics for the project
      const [overdueIssues, blockedIssues, highPriorityIssues] = await Promise.all([
        this._getOverdueIssuesCount(projectKey),
        this._getBlockedIssuesCount(projectKey),
        this._getHighPriorityIssuesCount(projectKey)
      ]);

      return {
        overdueIssues,
        blockedIssues,
        highPriorityIssues,
        lastCalculated: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Error fetching health metrics for project ${projectKey}:`, error);
      // Return default metrics as fallback
      return {
        overdueIssues: 0,
        blockedIssues: 0,
        highPriorityIssues: 0,
        lastCalculated: new Date().toISOString(),
        status: 'fallback'
      };
    }
  }

  /**
   * Get current user information
   * @returns {Promise<Object>} User profile data
   */
  async getCurrentUser() {
    try {
      const response = await this.apiClient.asUser().requestJira(route`/rest/api/3/myself`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Jira API error: ${data.message || response.statusText}`);
      }

      return {
        accountId: data.accountId,
        displayName: data.displayName,
        emailAddress: data.emailAddress,
        accountType: data.accountType
      };

    } catch (error) {
      console.error('Error fetching current user:', error);
      // Return fallback user data
      return {
        accountId: 'unknown',
        displayName: 'Executive User',
        emailAddress: 'unknown@company.com',
        accountType: 'atlassian'
      };
    }
  }

  /**
   * Get count of overdue issues for a project
   * @private
   */
  async _getOverdueIssuesCount(projectKey) {
    try {
      const jql = `project = "${projectKey}" AND due < now() AND resolution is EMPTY`;
      const response = await this.apiClient.asUser().requestJira(route`/rest/api/3/search`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jql,
          maxResults: 0,
          fields: ['key']
        })
      });

      const data = await response.json();
      return response.ok ? data.total : 0;

    } catch (error) {
      console.error(`Error getting overdue issues for ${projectKey}:`, error);
      return 0;
    }
  }

  /**
   * Get count of blocked issues for a project
   * @private
   */
  async _getBlockedIssuesCount(projectKey) {
    try {
      const jql = `project = "${projectKey}" AND status = "Blocked" AND resolution is EMPTY`;
      const response = await this.apiClient.asUser().requestJira(route`/rest/api/3/search`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jql,
          maxResults: 0,
          fields: ['key']
        })
      });

      const data = await response.json();
      return response.ok ? data.total : 0;

    } catch (error) {
      console.error(`Error getting blocked issues for ${projectKey}:`, error);
      return 0;
    }
  }

  /**
   * Get count of high priority unresolved issues for a project
   * @private
   */
  async _getHighPriorityIssuesCount(projectKey) {
    try {
      const jql = `project = "${projectKey}" AND priority in ("High", "Highest") AND resolution is EMPTY`;
      const response = await this.apiClient.asUser().requestJira(route`/rest/api/3/search`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jql,
          maxResults: 0,
          fields: ['key']
        })
      });

      const data = await response.json();
      return response.ok ? data.total : 0;

    } catch (error) {
      console.error(`Error getting high priority issues for ${projectKey}:`, error);
      return 0;
    }
  }
}