import React, {useEffect} from 'react';
import {Alert, ScrollView, StyleSheet, Text} from 'react-native';

import {authsignal} from '../authsignal';
import {getUserProfile, initPushRegistration, signOut} from '../api';
import {useAppContext} from '../context';
import {useForegroundEffect} from '../hooks/useForegroundEffect';

export function HomeScreen({navigation}: any) {
  const {setEmail, setAuthenticated} = useAppContext();

  // Prompt to create passkey
  useEffect(() => {
    (async () => {
      const shouldPromptToCreatePasskey = await authsignal.passkey.shouldPromptToCreatePasskey();

      if (shouldPromptToCreatePasskey) {
        navigation.navigate('CreatePasskey');
      }
    })();
  }, [navigation]);

  useEffect(() => {
    (async () => {
      try {
        const userProfile = await getUserProfile();

        setEmail(userProfile.email);
      } catch (error) {
        Alert.alert(
          'Error fetching user profile',
          error instanceof Error ? error.message : 'An unexpected error occurred',
          [
            {
              text: 'OK',
              onPress: async () => {
                await signOut();

                setAuthenticated(false);
              },
            },
          ],
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      const response = await authsignal.push.getCredential();

      if (response.data) {
        return;
      }

      await initPushRegistration();

      await authsignal.push.addCredential();
    })();
  }, [navigation]);

  useForegroundEffect(() => {
    (async () => {
      const response = await authsignal.push.getChallenge();

      if (response.data) {
        navigation.navigate('PushChallenge', {challengeId: response.data.challengeId});
      }
    })();
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Home</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 18,
  },
});
