import * as React from 'react';
import { View } from 'react-native';
import { Title, Button, Provider as PaperProvider } from 'react-native-paper';
import { DatePickerModal } from '../../src';
import { Platform } from 'react-native';
import TimePicker from '../../src/Time/TimePicker';

function App() {
  const [rangeOpen, setRangeOpen] = React.useState(false);
  const [singleOpen, setSingleOpen] = React.useState(false);
  const onDismissRange = React.useCallback(() => {
    setRangeOpen(false);
  }, [setRangeOpen]);
  const onDismissSingle = React.useCallback(() => {
    setSingleOpen(false);
  }, [setSingleOpen]);

  const onChangeRange = React.useCallback(({ startDate, endDate }) => {
    setRangeOpen(false);
    console.log({ startDate, endDate });
  }, []);
  const onChangeSingle = React.useCallback(({ date }) => {
    setSingleOpen(false);
    console.log({ date });
  }, []);

  return (
    <View style={{ alignItems: 'center', backgroundColor: '#FCFCFC', flex: 1 }}>
      <View
        style={{
          width: '100%',
          maxWidth: 350,
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          padding: 24,
        }}
      >
        <Title>Examples</Title>

        <View style={{ flexDirection: 'row', marginTop: 24 }}>
          <Button
            onPress={() => setRangeOpen(true)}
            uppercase={false}
            mode="outlined"
          >
            Pick range
          </Button>
          <View style={{ width: 6 }} />
          <Button
            onPress={() => setSingleOpen(true)}
            uppercase={false}
            mode="outlined"
          >
            Pick single date
          </Button>
        </View>

        <DatePickerModal
          mode="range"
          visible={rangeOpen}
          onDismiss={onDismissRange}
          startDate={undefined}
          endDate={undefined}
          onConfirm={onChangeRange}
          saveLabel={'Save'} // optional
          label={'Select period'} // optional
          startLabel={'From'} // optional
          endLabel={'To'} // optional
        />
        <DatePickerModal
          mode="single"
          visible={singleOpen}
          onDismiss={onDismissSingle}
          date={undefined}
          onConfirm={onChangeSingle}
          saveLabel={'Save'} // optional
          label={'Select date'} // optional
        />

        <TimePicker />
        {Platform.OS === 'web' ? (
          <style type="text/css">{`
        @font-face {
          font-family: 'MaterialCommunityIcons';
          src: url(${require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf')}) format('truetype');
        }
      `}</style>
        ) : null}
      </View>
    </View>
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
