import React from 'react';
import {SafeAreaView, StyleSheet, Text} from 'react-native';

import {Button} from '../components/Button';

export function SelectPinUserScreen({navigation, route}: any) {
  const usernames: string[] = route.params?.usernames ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Select user</Text>
      {usernames.map(username => (
        <Button theme="secondary" key={username} onPress={() => navigation.navigate('PinEntry', {username})}>
          {username}
        </Button>
      ))}
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
