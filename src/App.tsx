import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {FontAwesome6} from '@react-native-vector-icons/fontawesome6';

import {CreatePasskeyScreen} from './screens/CreatePasskeyScreen';
import {CreatePinScreen} from './screens/CreatePinScreen';
import {PushChallengeScreen} from './screens/PushChallengeScreen';
import {HomeScreen} from './screens/HomeScreen';
import {SignInScreen} from './screens/SignInScreen';
import {SelectPinUserScreen} from './screens/SelectPinUserScreen';
import {PinEntryScreen} from './screens/PinEntryScreen';
import {SignInEmailScreen} from './screens/SignInEmailScreen';
import {AppContext} from './context';
import {getAccessToken, signOut} from './api';
import {authsignal} from './authsignal';
import {RegisterWhatsAppScreen} from './screens/RegisterWhatsAppScreen';
import {PhoneNumberScreen} from './screens/PhoneNumberScreen';
import {SignInWhatsAppScreen} from './screens/SignInWhatsAppScreen';

const Stack = createStackNavigator();

function App() {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const initUser = async () => {
      const accessToken = await getAccessToken();

      setAuthenticated(!!accessToken);

      setInitialized(true);
    };

    initUser();
  }, []);

  const appContext = useMemo(
    () => ({
      email,
      authenticated,
      setEmail,
      setAuthenticated,
    }),
    [authenticated, email, setEmail, setAuthenticated],
  );

  const onSignOutPressed = async () => {
    await signOut();

    await authsignal.push.removeCredential();

    setAuthenticated(false);
    setEmail('');
  };

  if (!initialized) {
    return null;
  }

  return (
    <AppContext.Provider value={appContext}>
      <NavigationContainer>
        {authenticated ? (
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                animation: 'fade',
                // eslint-disable-next-line react/no-unstable-nested-components
                headerTitle: () => (
                  <Image style={styles.headerTitle} resizeMode={'contain'} source={require('../images/simplify.png')} />
                ),
                // eslint-disable-next-line react/no-unstable-nested-components
                headerRight: () => (
                  <TouchableOpacity
                    style={styles.headerRight}
                    onPress={async () => {
                      Alert.alert('Do you want to sign out?', `The current signed-in user is ${email}`, [
                        {
                          text: 'Cancel',
                          style: 'cancel',
                          onPress: () => {},
                        },
                        {text: 'Sign out', onPress: onSignOutPressed},
                      ]);
                    }}>
                    <FontAwesome6 name="user" size={18} color="#525eea" iconStyle="solid" />
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Group screenOptions={{presentation: 'modal', headerShown: false}}>
              <Stack.Screen name="CreatePasskey" component={CreatePasskeyScreen} />
              <Stack.Screen name="CreatePin" component={CreatePinScreen} />
              <Stack.Screen name="PushChallenge" component={PushChallengeScreen} />
              <Stack.Screen name="PhoneNumber" component={PhoneNumberScreen} />
              <Stack.Screen name="RegisterWhatsApp" component={RegisterWhatsAppScreen} />
            </Stack.Group>
          </Stack.Navigator>
        ) : (
          <Stack.Navigator>
            <Stack.Screen name="SignIn" component={SignInScreen} options={{headerShown: false}} />
            <Stack.Group screenOptions={{presentation: 'modal', title: '', headerBackTitle: 'Back'}}>
              <Stack.Screen name="SignInEmail" component={SignInEmailScreen} />
              <Stack.Screen name="SignInWhatsApp" component={SignInWhatsAppScreen} />
              <Stack.Screen name="SelectPinUser" component={SelectPinUserScreen} />
              <Stack.Screen name="PinEntry" component={PinEntryScreen} />
            </Stack.Group>
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </AppContext.Provider>
  );
}

export default App;

const styles = StyleSheet.create({
  headerTitle: {
    width: 250,
  },
  headerRight: {
    marginRight: 20,
  },
});
