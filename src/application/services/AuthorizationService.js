/**
 * AuthorizationService - Role-Based Access Control for Executive Data
 * Handles secure authorization for executive users and data filtering
 * Implements business rules for executive permissions and audit requirements
 */
export class AuthorizationService {
  constructor(forgeUserAdapter, auditService) {
    this.forgeUserAdapter = forgeUserAdapter;
    this.auditService = auditService;
  }

  /**
   * Gets user permissions from Forge platform
   * @param {string} executiveUserId - Executive user identifier
   * @returns {Promise<Array>} - Array of user permissions
   */
  async getUserPermissions(executiveUserId) {
    try {
      return await this.forgeUserAdapter.getUserPermissions(executiveUserId);
    } catch (error) {
      // Re-throw user service errors for proper error handling
      throw error;
    }
  }

  /**
   * Authorizes executive access to portfolio data for specific business unit
   * @param {string} executiveUserId - Executive user identifier
   * @param {string} businessUnit - Business unit to access
   * @param {string} authToken - Authentication token
   * @returns {Promise<boolean>} - True if access is authorized
   */
  async authorizePortfolioAccess(executiveUserId, businessUnit, authToken) {
    try {
      // Validate authentication token
      if (!authToken) {
        await this._logAuthorizationEvent(executiveUserId, businessUnit, 'DENIED', {
          reason: 'Invalid authentication token'
        });
        return false;
      }

      // Validate executive user ID format
      if (!this._isValidExecutiveUserId(executiveUserId)) {
        await this._logAuthorizationEvent(executiveUserId, businessUnit, 'DENIED', {
          reason: 'Invalid executive user ID format'
        });
        return false;
      }

      // Get user permissions
      const userPermissions = await this.forgeUserAdapter.getUserPermissions(executiveUserId);

      // Check for portfolio view permissions
      const hasPortfolioPermission = this._hasPermissionType(userPermissions, 'PORTFOLIO_VIEW');
      if (!hasPortfolioPermission) {
        await this._logAuthorizationEvent(executiveUserId, businessUnit, 'DENIED', {
          reason: 'No portfolio view permissions'
        });
        return false;
      }

      // Check business unit access
      const hasBusinessUnitAccess = this._hasBusinessUnitAccess(
        userPermissions,
        'PORTFOLIO_VIEW',
        businessUnit
      );

      if (!hasBusinessUnitAccess) {
        await this._logAuthorizationEvent(executiveUserId, businessUnit, 'DENIED', {
          reason: 'Insufficient permissions for business unit'
        });
        return false;
      }

      // Authorization successful
      await this._logAuthorizationEvent(executiveUserId, businessUnit, 'AUTHORIZED');
      return true;

    } catch (error) {
      // Handle authorization errors gracefully
      await this._logAuthorizationEvent(executiveUserId, businessUnit, 'ERROR', {
        reason: error.message
      });
      return false;
    }
  }

  /**
   * Filters portfolio data based on user permissions
   * @param {string} executiveUserId - Executive user identifier
   * @param {object} portfolioData - Raw portfolio data
   * @returns {Promise<object>} - Filtered portfolio data
   */
  async filterPortfolioDataByPermissions(executiveUserId, portfolioData) {
    try {
      const userPermissions = await this.forgeUserAdapter.getUserPermissions(executiveUserId);

      // Clone data to avoid modifying original
      const filteredData = JSON.parse(JSON.stringify(portfolioData));

      // Filter projects by business unit access
      if (filteredData.projects) {
        filteredData.projects = this._filterProjectsByBusinessUnit(
          filteredData.projects,
          userPermissions
        );

        // Remove sensitive project data based on permissions
        filteredData.projects = this._filterSensitiveProjectData(
          filteredData.projects,
          userPermissions
        );
      }

      // Remove sensitive financial data if not authorized
      if (!this._hasPermissionType(userPermissions, 'FINANCIAL_DATA')) {
        delete filteredData.financialData;
      }

      return filteredData;

    } catch (error) {
      // Return empty data on error to fail safe
      console.error('Error filtering portfolio data:', error.message);
      return { projects: [] };
    }
  }

  /**
   * Validates executive user ID format (must start with 'exec-')
   * @param {string} userId - User identifier to validate
   * @returns {boolean} - True if format is valid for executive
   * @private
   */
  _isValidExecutiveUserId(userId) {
    return typeof userId === 'string' && userId.startsWith('exec-');
  }

  /**
   * Checks if user has specific permission type
   * @param {Array} permissions - User permissions array
   * @param {string} permissionType - Permission type to check
   * @returns {boolean} - True if user has permission type
   * @private
   */
  _hasPermissionType(permissions, permissionType) {
    return permissions.some(permission => permission.type === permissionType);
  }

  /**
   * Checks if user has access to specific business unit for permission type
   * @param {Array} permissions - User permissions array
   * @param {string} permissionType - Permission type to check
   * @param {string} businessUnit - Business unit to check access for
   * @returns {boolean} - True if user has access to business unit
   * @private
   */
  _hasBusinessUnitAccess(permissions, permissionType, businessUnit) {
    const relevantPermissions = permissions.filter(p => p.type === permissionType);

    return relevantPermissions.some(permission =>
      permission.scope.includes(businessUnit) ||
      permission.scope.includes('All_Units')
    );
  }

  /**
   * Filters projects by business unit access permissions
   * @param {Array} projects - Array of project objects
   * @param {Array} permissions - User permissions array
   * @returns {Array} - Filtered projects array
   * @private
   */
  _filterProjectsByBusinessUnit(projects, permissions) {
    const portfolioPermissions = permissions.filter(p => p.type === 'PORTFOLIO_VIEW');

    if (portfolioPermissions.length === 0) {
      return [];
    }

    // Get all authorized business units
    const authorizedUnits = portfolioPermissions.reduce((units, permission) => {
      return units.concat(permission.scope);
    }, []);

    // Filter projects by authorized business units
    return projects.filter(project => {
      return authorizedUnits.includes(project.businessUnit) ||
             authorizedUnits.includes('All_Units');
    });
  }

  /**
   * Removes sensitive data from projects based on permissions
   * @param {Array} projects - Array of project objects
   * @param {Array} permissions - User permissions array
   * @returns {Array} - Projects with sensitive data filtered
   * @private
   */
  _filterSensitiveProjectData(projects, permissions) {
    const hasFinancialAccess = this._hasPermissionType(permissions, 'FINANCIAL_DATA');
    const hasDetailedMetrics = this._hasPermissionType(permissions, 'DETAILED_METRICS');

    return projects.map(project => {
      const filteredProject = { ...project };

      // Remove financial data if not authorized
      if (!hasFinancialAccess) {
        delete filteredProject.budget;
        delete filteredProject.revenue;
      }

      // Remove detailed metrics if not authorized
      if (!hasDetailedMetrics) {
        delete filteredProject.detailedMetrics;
      }

      return filteredProject;
    });
  }

  /**
   * Logs authorization events for audit purposes
   * @param {string} userId - User identifier
   * @param {string} businessUnit - Business unit being accessed
   * @param {string} result - Authorization result (AUTHORIZED/DENIED/ERROR)
   * @param {object} additionalData - Additional event data
   * @private
   */
  async _logAuthorizationEvent(userId, businessUnit, result, additionalData = {}) {
    const auditData = {
      userId,
      resource: 'PORTFOLIO_DATA',
      action: 'READ',
      businessUnit,
      result,
      timestamp: new Date(),
      ...additionalData
    };

    await this.auditService.logAuthorizationEvent(auditData);
  }
}