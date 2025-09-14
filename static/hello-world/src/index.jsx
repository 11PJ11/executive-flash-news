import ForgeUI, { render, Fragment, Text, Strong, useProductContext, useState, useEffect } from '@forge/ui';

/**
 * Presentation Layer: Welcome Widget UI Component
 * Executive Flash News dashboard widget UI
 */
const WelcomeWidget = () => {
  const context = useProductContext();
  const [welcomeData, setWelcomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(async () => {
    try {
      setLoading(true);

      // Call backend resolver function
      const response = await invoke('resolver', { context });

      if (response.success) {
        setWelcomeData(response.data);
      } else {
        setError(response.error);
        setWelcomeData(response.data); // Fallback data
      }
    } catch (err) {
      console.error('Error loading welcome data:', err);
      setError('Failed to load welcome message');
      // Set fallback data
      setWelcomeData({
        message: 'Welcome to Executive Flash News Plugin',
        version: 'v1.0.0',
        isExecutive: false,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Fragment>
        <Text>Loading Executive Flash News...</Text>
      </Fragment>
    );
  }

  if (error && !welcomeData) {
    return (
      <Fragment>
        <Text>⚠️ Error: {error}</Text>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Strong>{welcomeData.message}</Strong>
      <Text>Version: {welcomeData.version}</Text>
      {welcomeData.isExecutive && (
        <Text>🎯 Executive Dashboard Access</Text>
      )}
      <Text>Last updated: {new Date(welcomeData.timestamp).toLocaleString()}</Text>
    </Fragment>
  );
};

export default render(<WelcomeWidget />);

// Import invoke function for backend calls
import { invoke } from '@forge/bridge';