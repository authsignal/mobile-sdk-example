import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';

export const useForegroundEffect = (effect: () => void) => {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current?.match(/inactive|background/) && nextAppState === 'active') {
        effect();
      }
      if (nextAppState) {
        appStateRef.current = nextAppState;
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription.remove();
  }, [effect]);
};
