import * as React from 'react';
import { Platform, StyleSheet, ScrollView, View } from 'react-native';
import {
  Title,
  Button,
  Text,
  Provider as PaperProvider,
  Switch,
  DefaultTheme,
  DarkTheme,
  useTheme,
  overlay,
} from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from '../../src';

function App({
  onToggleDarkMode,
  dark,
}: {
  onToggleDarkMode: () => any;
  dark: boolean;
}) {
  const theme = useTheme();
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [range, setRange] = React.useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({ startDate: undefined, endDate: undefined });
  const [time, setTime] = React.useState<{
    hours: number | undefined;
    minutes: number | undefined;
  }>({ hours: undefined, minutes: undefined });
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

  const onChangeRange = React.useCallback(
    ({ startDate, endDate }) => {
      setRangeOpen(false);
      setRange({ startDate, endDate });
    },
    [setRangeOpen, setRange]
  );

  const onChangeSingle = React.useCallback(
    (params) => {
      setSingleOpen(false);
      setDate(params.date);
    },
    [setSingleOpen, setDate]
  );

  const onConfirmTime = React.useCallback(
    ({ hours, minutes }) => {
      setTimeOpen(false);
      setTime({ hours, minutes });
    },
    [setTimeOpen, setTime]
  );

  // generate date from time
  let timeDate = new Date();
  time.hours !== undefined && timeDate.setHours(time.hours);
  time.minutes !== undefined && timeDate.setMinutes(time.minutes);

  return (
    <>
      <ScrollView
        style={[
          styles.root,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <View
          style={[
            styles.content,
            {
              backgroundColor:
                theme.dark && theme.mode === 'adaptive'
                  ? overlay(3, theme.colors.surface)
                  : (theme.colors.surface as any),
            },
          ]}
        >
          <Title>Examples</Title>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Dark mode</Text>
            <View style={styles.switchSpace} />
            <Switch value={dark} onValueChange={onToggleDarkMode} />
          </View>
          <Enter />
          <Enter />
          <Enter />
          <Enter />
          <View>
            <Row>
              <Label>Date</Label>
              <Text>{date ? dateFormatter.format(date) : '-'}</Text>
            </Row>
            <Row>
              <Label>Range</Label>
              <Text>
                {[
                  range.startDate ? dateFormatter.format(range.startDate) : '',
                  range.endDate ? dateFormatter.format(range.endDate) : '',
                ].join(' - ')}
              </Text>
            </Row>
            <Row>
              <Label>Time</Label>
              <Text>
                {time && time.hours !== undefined && time.minutes !== undefined
                  ? timeFormatter.format(timeDate)
                  : '-'}
              </Text>
            </Row>
          </View>
          <Enter />
          <Enter />
          <View style={styles.buttons}>
            <Button
              onPress={() => setSingleOpen(true)}
              uppercase={false}
              mode="outlined"
            >
              Pick single date
            </Button>
            <View style={styles.buttonSeparator} />
            <Button
              onPress={() => setRangeOpen(true)}
              uppercase={false}
              mode="outlined"
            >
              Pick range
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
          <Enter />
          {/*<DatePickerInput />*/}
          {/*<Enter />*/}
          {/*<DateRangeInput />*/}
        </View>
      </ScrollView>
      <DatePickerModal
        mode="range"
        visible={rangeOpen}
        onDismiss={onDismissRange}
        startDate={undefined}
        endDate={undefined}
        onConfirm={onChangeRange}
        saveLabel="Save" // optional
        label="Select period" // optional
        startLabel="From" // optional
        endLabel="To" // optional
        animationType="slide" // optional, default is slide on ios/android and none on web
      />
      <DatePickerModal
        mode="single"
        visible={singleOpen}
        onDismiss={onDismissSingle}
        date={undefined}
        onConfirm={onChangeSingle}
        saveLabel="Save" // optional
        label="Select date" // optional
        animationType="slide" // optional, default is 'slide' on ios/android and 'none' on web
      />

      <TimePickerModal
        visible={timeOpen}
        onDismiss={onDismissTime}
        onConfirm={onConfirmTime}
        hours={time.hours} // optional, default: current hours
        minutes={time.minutes} // optional, default: current minutes
        label="Select time" // optional, default 'Select time'
        cancelLabel="Cancel" // optional, default: 'Cancel'
        confirmLabel="Ok" // optional, default: 'Ok'
        animationType="fade" // optional, default is 'none'
      />
    </>
  );
}

function Enter() {
  return <View style={styles.enter} />;
}

function Row({ children }: { children: any }) {
  return <View style={styles.row}>{children}</View>;
}

function Label({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Text style={[styles.label, { ...theme.fonts.medium }]}>{children}</Text>
  );
}

export default function AppWithProviders() {
  const [dark, setDark] = React.useState(false);
  const onToggleDarkMode = () => {
    setDark((prev) => !prev);
  };

  return (
    <PaperProvider
      theme={
        dark
          ? { ...DarkTheme, roundness: 10 }
          : { ...DefaultTheme, roundness: 10 }
      }
    >
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
    marginTop: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
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
  enter: { height: 12 },
  label: { width: 100, fontSize: 16 },
  row: { paddingTop: 12, paddingBottom: 12, flexDirection: 'row' },
});
