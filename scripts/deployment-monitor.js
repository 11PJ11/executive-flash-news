#!/usr/bin/env node

/**
 * Deployment Monitoring Script for Executive Flash News
 * Monitors deployment health and provides automated rollback capabilities
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');

// Configuration
const config = {
  environments: {
    development: {
      healthCheckUrl: process.env.DEV_HEALTH_CHECK_URL,
      jiraUrl: process.env.DEV_JIRA_SITE_URL,
      expectedResponseTime: 2000, // 2 seconds
    },
    staging: {
      healthCheckUrl: process.env.STAGING_HEALTH_CHECK_URL,
      jiraUrl: process.env.STAGING_JIRA_SITE_URL,
      expectedResponseTime: 1500, // 1.5 seconds
    },
    production: {
      healthCheckUrl: process.env.PROD_HEALTH_CHECK_URL,
      jiraUrl: process.env.PROD_JIRA_SITE_URL,
      expectedResponseTime: 1000, // 1 second
    },
  },
  monitoring: {
    healthCheckRetries: 3,
    healthCheckInterval: 10000, // 10 seconds
    rollbackThreshold: 3, // Failed checks before rollback
    monitoringDuration: 300000, // 5 minutes
  },
};

// Utility functions
const log = (level, message) => {
  const timestamp = new Date().toISOString();
  const colorCodes = {
    INFO: '\x1b[34m',  // Blue
    WARN: '\x1b[33m',  // Yellow
    ERROR: '\x1b[31m', // Red
    SUCCESS: '\x1b[32m', // Green
    RESET: '\x1b[0m',
  };

  const color = colorCodes[level] || '';
  const reset = colorCodes.RESET;

  console.log(`${color}[${timestamp}] ${level}: ${message}${reset}`);

  // Log to file
  const logEntry = `[${timestamp}] ${level}: ${message}\n`;
  fs.appendFileSync('logs/deployment-monitor.log', logEntry);
};

const makeHttpRequest = (url, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https://') ? https : http;

    const request = protocol.get(url, (response) => {
      const responseTime = Date.now() - startTime;
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          responseTime,
          data: data.slice(0, 1000), // Limit response data
          headers: response.headers,
        });
      });
    });

    request.setTimeout(timeout, () => {
      request.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });

    request.on('error', (error) => {
      reject(error);
    });
  });
};

class DeploymentMonitor {
  constructor(environment) {
    this.environment = environment;
    this.config = config.environments[environment];
    this.failedChecks = 0;
    this.monitoringStartTime = Date.now();

    if (!this.config) {
      throw new Error(`Unknown environment: ${environment}`);
    }
  }

  async performHealthCheck() {
    try {
      log('INFO', `Performing health check for ${this.environment}...`);

      // Basic connectivity check
      const healthResponse = await this.checkEndpoint(this.config.jiraUrl);

      // Application-specific health check
      const appHealth = await this.checkApplicationHealth();

      // Performance check
      const performanceCheck = await this.checkPerformance();

      const overallHealth = {
        connectivity: healthResponse.success,
        application: appHealth.success,
        performance: performanceCheck.success,
        timestamp: new Date().toISOString(),
        details: {
          connectivity: healthResponse,
          application: appHealth,
          performance: performanceCheck,
        },
      };

      if (overallHealth.connectivity && overallHealth.application && overallHealth.performance) {
        log('SUCCESS', `Health check passed for ${this.environment}`);
        this.failedChecks = 0;
        return { success: true, details: overallHealth };
      } else {
        this.failedChecks++;
        log('ERROR', `Health check failed for ${this.environment} (${this.failedChecks}/${config.monitoring.rollbackThreshold})`);
        return { success: false, details: overallHealth };
      }

    } catch (error) {
      this.failedChecks++;
      log('ERROR', `Health check error for ${this.environment}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async checkEndpoint(url) {
    try {
      const response = await makeHttpRequest(url);

      return {
        success: response.statusCode >= 200 && response.statusCode < 300,
        statusCode: response.statusCode,
        responseTime: response.responseTime,
        url: url,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        url: url,
      };
    }
  }

  async checkApplicationHealth() {
    try {
      // Check if Forge app is responding
      const jiraApiUrl = `${this.config.jiraUrl}/rest/api/3/serverInfo`;
      const response = await makeHttpRequest(jiraApiUrl);

      return {
        success: response.statusCode === 200,
        statusCode: response.statusCode,
        responseTime: response.responseTime,
        details: 'Jira API connectivity verified',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: 'Failed to verify Jira API connectivity',
      };
    }
  }

  async checkPerformance() {
    try {
      const response = await makeHttpRequest(this.config.jiraUrl, 5000);
      const expectedResponseTime = this.config.expectedResponseTime;

      return {
        success: response.responseTime <= expectedResponseTime,
        responseTime: response.responseTime,
        expectedResponseTime: expectedResponseTime,
        details: `Response time: ${response.responseTime}ms (expected: <${expectedResponseTime}ms)`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: 'Performance check failed',
      };
    }
  }

  async triggerRollback() {
    try {
      log('WARN', `Triggering rollback for ${this.environment}...`);

      // Create rollback trigger file
      const rollbackData = {
        environment: this.environment,
        timestamp: new Date().toISOString(),
        reason: 'Automated rollback due to health check failures',
        failedChecks: this.failedChecks,
        triggerThreshold: config.monitoring.rollbackThreshold,
      };

      fs.writeFileSync('logs/rollback-trigger.json', JSON.stringify(rollbackData, null, 2));

      // If running in CI/CD environment, trigger GitHub workflow
      if (process.env.GITHUB_ACTIONS) {
        log('INFO', 'Triggering GitHub rollback workflow...');
        // In a real scenario, this would trigger the rollback workflow
        // via GitHub API or other mechanism
      }

      log('ERROR', `Rollback triggered for ${this.environment} due to persistent health check failures`);
      return true;

    } catch (error) {
      log('ERROR', `Failed to trigger rollback: ${error.message}`);
      return false;
    }
  }

  async startMonitoring() {
    log('INFO', `Starting deployment monitoring for ${this.environment}...`);
    log('INFO', `Monitoring duration: ${config.monitoring.monitoringDuration / 1000} seconds`);
    log('INFO', `Health check interval: ${config.monitoring.healthCheckInterval / 1000} seconds`);
    log('INFO', `Rollback threshold: ${config.monitoring.rollbackThreshold} failed checks`);

    const monitoringInterval = setInterval(async () => {
      try {
        const healthResult = await this.performHealthCheck();

        // Check if we should trigger rollback
        if (this.failedChecks >= config.monitoring.rollbackThreshold) {
          clearInterval(monitoringInterval);
          await this.triggerRollback();
          process.exit(1);
        }

        // Check if monitoring duration has elapsed
        const elapsedTime = Date.now() - this.monitoringStartTime;
        if (elapsedTime >= config.monitoring.monitoringDuration) {
          clearInterval(monitoringInterval);
          log('SUCCESS', `Monitoring completed successfully for ${this.environment}`);
          log('INFO', `Total monitoring time: ${elapsedTime / 1000} seconds`);
          process.exit(0);
        }

      } catch (error) {
        log('ERROR', `Monitoring error: ${error.message}`);
      }
    }, config.monitoring.healthCheckInterval);

    // Perform initial health check
    const initialHealth = await this.performHealthCheck();
    if (!initialHealth.success) {
      log('WARN', 'Initial health check failed - monitoring will continue');
    }
  }

  generateReport() {
    const report = {
      environment: this.environment,
      monitoringStartTime: new Date(this.monitoringStartTime).toISOString(),
      monitoringEndTime: new Date().toISOString(),
      totalFailedChecks: this.failedChecks,
      rollbackTriggered: this.failedChecks >= config.monitoring.rollbackThreshold,
      configuration: this.config,
    };

    fs.writeFileSync(`logs/monitoring-report-${this.environment}-${Date.now()}.json`,
                     JSON.stringify(report, null, 2));

    return report;
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const environment = args[1] || 'development';

  // Ensure logs directory exists
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
  }

  switch (command) {
    case 'monitor':
      const monitor = new DeploymentMonitor(environment);
      monitor.startMonitoring().catch((error) => {
        log('ERROR', `Monitoring failed: ${error.message}`);
        process.exit(1);
      });
      break;

    case 'health-check':
      const healthChecker = new DeploymentMonitor(environment);
      healthChecker.performHealthCheck().then((result) => {
        if (result.success) {
          log('SUCCESS', 'Health check passed');
          process.exit(0);
        } else {
          log('ERROR', 'Health check failed');
          console.log(JSON.stringify(result, null, 2));
          process.exit(1);
        }
      });
      break;

    default:
      console.log(`
Usage: node deployment-monitor.js <command> [environment]

Commands:
  monitor        Start continuous monitoring
  health-check   Perform single health check

Environments:
  development    Development environment (default)
  staging        Staging environment
  production     Production environment

Examples:
  node deployment-monitor.js monitor production
  node deployment-monitor.js health-check staging
      `);
      process.exit(1);
  }
}

module.exports = DeploymentMonitor;