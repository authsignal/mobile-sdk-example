import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

import {Button} from '../components/Button';
import {useAppContext} from '../context';
import {sendOtp, signInWithOtp} from '../api';

export function SignInEmailScreen({navigation, route}: any) {
  const {setAuthenticated, setEmail} = useAppContext();

  const [code, setCode] = useState('');

  const {challengeId, email} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Confirm your email</Text>
      <Text style={styles.text}>Enter the code sent to {email}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter verification code"
        onChangeText={setCode}
        value={code}
        autoFocus={true}
        keyboardType={'number-pad'}
      />
      <Button
        onPress={async () => {
          const response = await signInWithOtp({challengeId, verificationCode: code});

          if (!response.isVerified) {
            Alert.alert('Invalid code');
          } else if (response.challengeId) {
            navigation.navigate('SignInWhatsApp', response);
          } else {
            try {
              setEmail(email);
              setAuthenticated(true);
            } catch (ex) {
              if (ex instanceof Error) {
                return Alert.alert('Error', ex.message);
              }
            }
          }
        }}>
        Confirm
      </Button>
      <View style={styles.center}>
        <Text>Didn't receive a code?</Text>
        <TouchableOpacity
          onPress={async () => {
            setCode('');

            const {errorCode} = await sendOtp({challengeId});

            if (errorCode) {
              Alert.alert('Unable to resend code.', `Error code: ${errorCode}`);
            } else {
              Alert.alert('Verification code re-sent');
            }
          }}>
          <Text style={styles.link}>Re-send it</Text>
        </TouchableOpacity>
      </View>
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
  text: {
    marginHorizontal: 20,
  },
  link: {
    color: '#525EEA',
    marginLeft: 5,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  center: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
});
