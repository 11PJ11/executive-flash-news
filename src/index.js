import ForgeUI, { render, Fragment, Text, Strong } from '@forge/ui';

const App = () => {
  return (
    <Fragment>
      <Text>
        <Strong>Welcome to Executive Flash News Plugin</Strong>
      </Text>
      <Text>Version: v1.0.0</Text>
      <Text>Status: Active</Text>
    </Fragment>
  );
};

export const run = render(<App />);