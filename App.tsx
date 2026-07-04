import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PillHeader } from './src/components/PillHeader';
import { CounterScreen } from './src/screens/CounterScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SettingsProvider, useSettings } from './src/settings/SettingsContext';
import { getTheme } from './src/theme/theme';

function Root() {
  const { theme: themeName } = useSettings();
  const theme = getTheme(themeName);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [pageWidth, setPageWidth] = useState(0);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const progress = useMemo(() => Animated.divide(scrollX, pageWidth || 1), [scrollX, pageWidth]);

  const onLayout = (e: { nativeEvent: { layout: { width: number } } }) => setPageWidth(e.nativeEvent.layout.width);

  const goTo = (screen: 'counter' | 'history') => {
    scrollRef.current?.scrollTo({ x: screen === 'counter' ? 0 : pageWidth, animated: true });
  };

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      <PillHeader
        progress={progress}
        settingsOpen={settingsVisible}
        onSelectCounter={() => goTo('counter')}
        onSelectHistory={() => goTo('history')}
        onOpenSettings={() => setSettingsVisible(true)}
      />
      <View style={styles.pager} onLayout={onLayout}>
        {pageWidth > 0 && (
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            <View style={{ width: pageWidth }}>
              <CounterScreen />
            </View>
            <View style={{ width: pageWidth }}>
              <HistoryScreen />
            </View>
          </Animated.ScrollView>
        )}
      </View>

      <Modal
        visible={settingsVisible}
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <SettingsScreen visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <Root />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
});
