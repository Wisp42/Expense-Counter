import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
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
  const [pageWidth, setPageWidth] = useState(0);
  const [activeScreen, setActiveScreen] = useState<'counter' | 'history'>('counter');
  const [settingsVisible, setSettingsVisible] = useState(false);

  const onLayout = (e: LayoutChangeEvent) => setPageWidth(e.nativeEvent.layout.width);

  const goTo = (screen: 'counter' | 'history') => {
    setActiveScreen(screen);
    scrollRef.current?.scrollTo({ x: screen === 'counter' ? 0 : pageWidth, animated: true });
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!pageWidth) return;
    const idx = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    setActiveScreen(idx === 0 ? 'counter' : 'history');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      <PillHeader
        activeScreen={activeScreen}
        onSelectCounter={() => goTo('counter')}
        onSelectHistory={() => goTo('history')}
        onOpenSettings={() => setSettingsVisible(true)}
      />
      <View style={styles.pager} onLayout={onLayout}>
        {pageWidth > 0 && (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
          >
            <View style={{ width: pageWidth }}>
              <CounterScreen />
            </View>
            <View style={{ width: pageWidth }}>
              <HistoryScreen />
            </View>
          </ScrollView>
        )}
      </View>

      <Modal
        visible={settingsVisible}
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <SettingsScreen onClose={() => setSettingsVisible(false)} />
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
