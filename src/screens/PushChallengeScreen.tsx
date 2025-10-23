import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';

import {Button} from '../components/Button';
import {authsignal} from '../authsignal';

export function PushChallengeScreen({navigation, route}: any) {
  const challengeId = route.params?.challengeId;

  if (!challengeId) {
    return <View />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Authentication request</Text>
      <Button
        onPress={async () => {
          await authsignal.push.updateChallenge({
            challengeId,
            approved: true,
          });

          navigation.goBack();
        }}>
        Approve
      </Button>
      <Button
        theme="secondary"
        onPress={async () => {
          await authsignal.push.updateChallenge({
            challengeId,
            approved: false,
          });

          navigation.goBack();
        }}>
        Deny
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    marginHorizontal: 20,
  },
});
