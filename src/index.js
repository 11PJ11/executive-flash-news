import ForgeUI, {
  render,
  Fragment,
  Text,
  Strong,
  Button,
  useAction,
  useState,
  useEffect,
  StatusLozenge,
  Table,
  Head,
  Cell,
  Row
} from '@forge/ui';

import { DashboardResolver } from './presentation/resolvers/DashboardResolver.js';

const App = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date().toISOString());

  const resolver = new DashboardResolver();

  // Load dashboard data on component mount
  useEffect(async () => {
    setIsLoading(true);
    try {
      const data = await resolver.resolveDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setDashboardData({
        error: { message: 'Failed to load dashboard' }
      });
    }
    setIsLoading(false);
  }, []);

  // Refresh handler
  const [handleRefresh] = useAction(async () => {
    setIsLoading(true);
    try {
      const refreshResult = await resolver.handleRefresh();
      if (refreshResult.success) {
        setDashboardData(refreshResult.data);
        setLastRefresh(new Date().toISOString());
      } else {
        console.error('Refresh failed:', refreshResult.message);
      }
    } catch (error) {
      console.error('Refresh error:', error);
    }
    setIsLoading(false);
  });

  if (isLoading) {
    return (
      <Fragment>
        <Text>
          <Strong>Executive Portfolio Health Dashboard</Strong>
        </Text>
        <Text>Loading dashboard data...</Text>
      </Fragment>
    );
  }

  if (dashboardData?.error) {
    return (
      <Fragment>
        <Text>
          <Strong>Executive Portfolio Health Dashboard</Strong>
        </Text>
        <StatusLozenge text="Error" appearance="removed" />
        <Text>{dashboardData.error.message}</Text>
        <Button text="Retry" onClick={handleRefresh} />
      </Fragment>
    );
  }

  const { portfolio, criticalAlerts, executive, performance } = dashboardData;

  return (
    <Fragment>
      <Text>
        <Strong>Executive Portfolio Health Dashboard</Strong>
      </Text>

      {/* Executive Info */}
      <Text>Welcome, {executive?.name || 'Executive User'}</Text>

      {/* Portfolio Summary */}
      <Fragment>
        <Text><Strong>Portfolio Summary</Strong></Text>
        <Text>Total Projects: {portfolio.totalProjects}</Text>
        <Text>Health Score: {portfolio.healthScore}%</Text>
        <Text>On Track: {portfolio.onTrackProjects} | At Risk: {portfolio.atRiskProjects}</Text>

        {portfolio.healthScore >= 80 && (
          <StatusLozenge text="Healthy" appearance="success" />
        )}
        {portfolio.healthScore >= 60 && portfolio.healthScore < 80 && (
          <StatusLozenge text="Needs Attention" appearance="inprogress" />
        )}
        {portfolio.healthScore < 60 && (
          <StatusLozenge text="Critical" appearance="removed" />
        )}
      </Fragment>

      {/* Critical Alerts */}
      {criticalAlerts && criticalAlerts.length > 0 && (
        <Fragment>
          <Text><Strong>Critical Alerts ({criticalAlerts.length})</Strong></Text>
          <Table>
            <Head>
              <Cell>
                <Text>Project</Text>
              </Cell>
              <Cell>
                <Text>Alert Level</Text>
              </Cell>
              <Cell>
                <Text>Reason</Text>
              </Cell>
            </Head>
            {criticalAlerts.map((alert, index) => (
              <Row key={index}>
                <Cell>
                  <Text>{alert.projectName} ({alert.projectKey})</Text>
                </Cell>
                <Cell>
                  <StatusLozenge text={alert.alertLevel} appearance="removed" />
                </Cell>
                <Cell>
                  <Text>{alert.reason}</Text>
                </Cell>
              </Row>
            ))}
          </Table>
        </Fragment>
      )}

      {/* No Alerts Message */}
      {(!criticalAlerts || criticalAlerts.length === 0) && (
        <Fragment>
          <Text><Strong>Critical Alerts</Strong></Text>
          <StatusLozenge text="No Critical Issues" appearance="success" />
          <Text>All projects are performing within acceptable parameters</Text>
        </Fragment>
      )}

      {/* Footer */}
      <Fragment>
        <Text>Last Updated: {new Date(lastRefresh).toLocaleString()}</Text>
        {performance && (
          <Text>Response Time: {performance.responseTimeMs}ms</Text>
        )}
        <Button text="Refresh Data" onClick={handleRefresh} />
      </Fragment>
    </Fragment>
  );
};

export const run = render(<App />);