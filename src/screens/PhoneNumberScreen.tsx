import React, {useState} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {Button} from '../components/Button';
import {initWhatsAppRegistration} from '../api';

export function PhoneNumberScreen({navigation}: any) {
  const [loading, setLoading] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('+64278050845');

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.header}>Enter your phone number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              onChangeText={setPhoneNumber}
              value={phoneNumber}
              autoCapitalize={'none'}
              autoCorrect={false}
              autoFocus={true}
              textContentType={'telephoneNumber'}
            />
          </View>
          <Button
            loading={loading}
            onPress={async () => {
              setLoading(true);

              const {challengeId} = await initWhatsAppRegistration({phoneNumber});

              navigation.navigate('RegisterWhatsApp', {phoneNumber, challengeId});

              setLoading(false);
            }}>
            Continue
          </Button>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  inputContainer: {
    alignSelf: 'stretch',
    height: 46,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#E8E8E8',
    alignSelf: 'stretch',
    height: 46,
    borderRadius: 6,
    padding: 10,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 20,
  },
});
