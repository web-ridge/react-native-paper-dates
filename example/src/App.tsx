import * as React from 'react';
import { ScrollView, View } from 'react-native';
import {
  Title,
  Button,
  Text,
  Provider as PaperProvider,
  Switch,
  DefaultTheme,
  DarkTheme,
  useTheme,
} from 'react-native-paper';
import { DatePickerModal } from '../../src';
import { Platform } from 'react-native';
import TimePicker from '../../src/Time/TimePicker';

function App({
  onToggleDarkMode,
  dark,
}: {
  onToggleDarkMode: () => any;
  dark: boolean;
}) {
  const theme = useTheme();
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
    <ScrollView
      scrollEnabled={false}
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
      }}
      contentInsetAdjustmentBehavior="always"
    >
      <View
        style={{
          width: '100%',
          maxWidth: 450,
          backgroundColor: theme.colors.surface,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          padding: 24,
          alignSelf: 'center',
          flex: 1,
        }}
      >
        <Title>Examples</Title>
        <View style={{ flexDirection: 'row', marginTop: 24 }}>
          <Text>Dark mode</Text>
          <View style={{ flex: 1 }} />
          <Switch value={dark} onValueChange={onToggleDarkMode} />
        </View>
        <View
          style={{
            backgroundColor: theme.colors.primary,
            width: 50,
            height: 50,
          }}
        />
        <View
          style={{
            backgroundColor: theme.colors.accent,
            width: 50,
            height: 50,
          }}
        />
        <View
          style={{
            backgroundColor: theme.colors.background,
            width: 50,
            height: 50,
          }}
        />
        <View
          style={{
            backgroundColor: theme.colors.surface,
            width: 50,
            height: 50,
          }}
        />

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

        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <TimePicker />
        </View>
      </View>
    </ScrollView>
  );
}

export default function AppWithProviders() {
  const [dark, setDark] = React.useState(false);
  const onToggleDarkMode = () => {
    setDark((prev) => !prev);
  };

  return (
    <PaperProvider theme={dark ? DarkTheme : DefaultTheme}>
      <React.Fragment>
        {Platform.OS === 'web' ? (
          <style type="text/css">{`
          @font-face {
            font-family: 'MaterialCommunityIcons';
            src: url(${require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf')}) format('truetype');
          }
        `}</style>
        ) : null}
        <App onToggleDarkMode={onToggleDarkMode} dark={dark} />
      </React.Fragment>
    </PaperProvider>
  );
}
