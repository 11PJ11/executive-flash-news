/**
 * AuthenticationService - Executive Authentication Business Logic
 * Handles secure authentication for executive users through Forge platform
 * Implements business rules for executive security and audit requirements
 */
export class AuthenticationService {
  constructor(forgeAuthAdapter, auditService) {
    this.forgeAuthAdapter = forgeAuthAdapter;
    this.auditService = auditService;
  }

  /**
   * Validates executive credentials through Forge platform
   * @param {string} executiveUserId - Executive user identifier
   * @returns {Promise<boolean>} - True if credentials are valid
   */
  async validateCredentials(executiveUserId) {
    try {
      return await this.forgeAuthAdapter.validateForgeCredentials(executiveUserId);
    } catch (error) {
      // Re-throw Forge service errors for proper error handling
      throw error;
    }
  }

  /**
   * Authenticates executive user through Forge platform
   * @param {string} executiveUserId - Executive user identifier
   * @param {object} authOptions - Authentication options
   * @returns {Promise<object>} - Authentication result with token and user info
   */
  async authenticateUser(executiveUserId, authOptions) {
    try {
      // Validate business rule: Forge context required for executives
      if (!authOptions.forgeContext) {
        const failureResult = {
          success: false,
          error: 'Forge context required for executive authentication',
          token: null,
          user: null
        };

        await this._logAuthenticationEvent(executiveUserId, 'AUTHENTICATION_FAILURE', {
          error: failureResult.error
        });

        return failureResult;
      }

      // Validate executive user ID format
      if (!this._isValidExecutiveUserId(executiveUserId)) {
        const failureResult = {
          success: false,
          error: 'Invalid executive user ID format',
          token: null,
          user: null
        };

        await this._logAuthenticationEvent(executiveUserId, 'AUTHENTICATION_FAILURE', {
          error: failureResult.error
        });

        return failureResult;
      }

      // Validate minimum security level for executives
      if (authOptions.securityLevel === 'low') {
        const failureResult = {
          success: false,
          error: 'Insufficient security level for executive access',
          token: null,
          user: null
        };

        await this._logAuthenticationEvent(executiveUserId, 'AUTHENTICATION_FAILURE', {
          error: failureResult.error
        });

        return failureResult;
      }

      // Attempt authentication through Forge
      const authResult = await this.forgeAuthAdapter.authenticateWithForge(
        executiveUserId,
        authOptions
      );

      // Log authentication result
      if (authResult.success) {
        await this._logAuthenticationEvent(executiveUserId, 'AUTHENTICATION_SUCCESS');
      } else {
        await this._logAuthenticationEvent(executiveUserId, 'AUTHENTICATION_FAILURE', {
          error: authResult.error
        });
      }

      return authResult;

    } catch (error) {
      // Handle service unavailable gracefully
      const errorResult = {
        success: false,
        error: error.message,
        token: null,
        user: null
      };

      await this._logAuthenticationEvent(executiveUserId, 'AUTHENTICATION_ERROR', {
        error: error.message
      });

      return errorResult;
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
   * Logs authentication events for audit purposes
   * @param {string} userId - User identifier
   * @param {string} event - Event type
   * @param {object} additionalData - Additional event data
   * @private
   */
  async _logAuthenticationEvent(userId, event, additionalData = {}) {
    const auditData = {
      userId,
      event,
      timestamp: new Date(),
      method: 'FORGE',
      ...additionalData
    };

    await this.auditService.logAuthenticationEvent(auditData);
  }
}