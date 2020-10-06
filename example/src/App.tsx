import * as React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
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

import TimePickerModal from '../../src/Time/TimePickerModal';
import DatePickerInput from '../../src/Date/DatePickerInput';
import DateRangeInput from '../../src/Date/DateRangeInput';

function App({
  onToggleDarkMode,
  dark,
}: {
  onToggleDarkMode: () => any;
  dark: boolean;
}) {
  const theme = useTheme();
  const [timeOpen, setTimeOpen] = React.useState(false);
  const [rangeOpen, setRangeOpen] = React.useState(false);
  const [singleOpen, setSingleOpen] = React.useState(false);
  const onDismissTime = React.useCallback(() => {
    setTimeOpen(false);
  }, [setTimeOpen]);
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
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
      contentInsetAdjustmentBehavior="always"
    >
      <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
        <Title>Examples</Title>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Dark mode</Text>
          <View style={styles.switchSpace} />
          <Switch value={dark} onValueChange={onToggleDarkMode} />
        </View>

        <View style={styles.buttons}>
          <Button
            onPress={() => setRangeOpen(true)}
            uppercase={false}
            mode="outlined"
          >
            Pick range
          </Button>
          <View style={styles.buttonSeparator} />
          <Button
            onPress={() => setSingleOpen(true)}
            uppercase={false}
            mode="outlined"
          >
            Pick single date
          </Button>
          <View style={styles.buttonSeparator} />
          <Button
            onPress={() => setTimeOpen(true)}
            uppercase={false}
            mode="outlined"
          >
            Pick time
          </Button>
        </View>
        <View style={{ height: 12 }} />
        <DatePickerInput />
        <View style={{ height: 12 }} />
        <DateRangeInput />

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

        <TimePickerModal visible={timeOpen} onDismiss={onDismissTime} />
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 450,

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
  },
  switchContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  switchSpace: { flex: 1 },
  switchLabel: { fontSize: 16 },
  buttons: { flexDirection: 'row', marginTop: 24 },
  buttonSeparator: { width: 6 },
});
