import React, {useState} from 'react';
import {ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';
import * as Keychain from 'react-native-keychain';

import {authsignal} from '../authsignal';
import {signIn} from '../api';
import {useAppContext} from '../context';

export function PinEntryScreen() {
  const {setAuthenticated} = useAppContext();

  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState('');

  const onChangePinText = (value: string) => {
    if (value.length === 6) {
      submitPin(value);
      setPin('');
    } else {
      setPin(value);
    }
  };

  const submitPin = async (value: string) => {
    setLoading(true);

    const pinCredentials = await Keychain.getGenericPassword({service: '@simplify'});

    if (pinCredentials && pinCredentials.password !== value) {
      setLoading(false);

      return Alert.alert('Invalid PIN');
    }

    const {data, error} = await authsignal.inapp.verify({action: 'signIn', username: 'chris@authsignal.com'});

    if (!data?.token) {
      setLoading(false);

      return Alert.alert('Error signing in with PIN.', error);
    }

    try {
      await signIn(data.token);

      await setAuthenticated(true);
    } catch (err) {
      setLoading(false);

      if (err instanceof Error) {
        Alert.alert('Error', err.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.center} />
      ) : (
        <>
          <Text style={styles.header}>Enter PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your 6 digit PIN"
            onChangeText={onChangePinText}
            value={pin}
            autoFocus={true}
            keyboardType={'number-pad'}
            maxLength={6}
            secureTextEntry={true}
          />
        </>
      )}
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
  image: {
    width: 100,
    height: 100,
    marginLeft: 10,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  text: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  input: {
    backgroundColor: '#E8E8E8',
    alignSelf: 'stretch',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    height: 46,
    borderRadius: 6,
    padding: 10,
  },
  center: {
    margin: 20,
    alignSelf: 'center',
  },
});
