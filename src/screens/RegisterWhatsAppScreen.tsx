import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

import {Button} from '../components/Button';
import {initWhatsAppRegistration, finishWhatsAppRegistration} from '../api';

export function RegisterWhatsAppScreen({navigation, route}: any) {
  const [challengeId, setChallengeId] = useState(route.params.challengeId);

  const [code, setCode] = useState('');

  const {phoneNumber} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Confirm your phone number</Text>
      <Text style={styles.text}>Enter the code sent to {phoneNumber}</Text>
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
          try {
            const {isVerified} = await finishWhatsAppRegistration({challengeId, verificationCode: code});

            if (!isVerified) {
              Alert.alert('Invalid code');
            } else {
              Alert.alert('Successfully enrolled with WhatsApp');

              navigation.popToTop();
            }
          } catch (ex) {
            if (ex instanceof Error) {
              Alert.alert('Error', ex.message);
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

            const response = await initWhatsAppRegistration({phoneNumber});

            setChallengeId(response.challengeId);

            Alert.alert('Verification code re-sent');
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
