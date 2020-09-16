import * as React from 'react';
import { Button, Provider as PaperProvider } from 'react-native-paper';
import { DatePickerModal } from '../../src';
import { Platform } from 'react-native';
import TimePicker from '../../src/TimePicker';

function App() {
  const [visible, setVisible] = React.useState(false);
  const onDismiss = React.useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const onChange = React.useCallback(({ startDate, endDate }) => {
    setVisible(false);
    console.log({ startDate, endDate });
  }, []);

  return (
    <>
      <DatePickerModal
        mode="range"
        visible={visible}
        onDismiss={onDismiss}
        startDate={undefined}
        endDate={undefined}
        onConfirm={onChange}
        saveLabel={'Save'} // optional
        label={'Select period'} // optional
        startLabel={'From'} // optional
        endLabel={'To'} // optional
      />
      <Button onPress={() => setVisible(true)}>Pick range</Button>
      <TimePicker />
      {Platform.OS === 'web' ? (
        <style type="text/css">{`
        @font-face {
          font-family: 'MaterialCommunityIcons';
          src: url(${require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf')}) format('truetype');
        }
      `}</style>
      ) : null}
    </>
  );
}

export default function AppWithProviders() {
  return (
    <PaperProvider>
      <React.Fragment>
        {Platform.OS === 'web' ? (
          <style type="text/css">{`
          @font-face {
            font-family: 'MaterialCommunityIcons';
            src: url(${require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf')}) format('truetype');
          }
        `}</style>
        ) : null}
        <App />
      </React.Fragment>
    </PaperProvider>
  );
}
