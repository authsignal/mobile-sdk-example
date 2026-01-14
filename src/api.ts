import {API_GATEWAY_ID, AWS_REGION} from '@env';
import * as Keychain from 'react-native-keychain';

import {authsignal} from './authsignal';

const url = `https://${API_GATEWAY_ID}.execute-api.${AWS_REGION}.amazonaws.com`;

const deviceId = '63e07717-5efd-4687-8d12-5bba3ac06b32';

interface SendOtpInput {
  email?: string;
  phoneNumber?: string;
  verificationMethod?: 'EMAIL_OTP' | 'WHATSAPP';
  challengeId?: string;
}

export async function sendOtp(input: SendOtpInput) {
  const {challengeId, errorCode, errorDescription} = await fetch(`${url}/otp`, {
    method: 'POST',
    body: JSON.stringify({...input, deviceId}),
  }).then(res => res.json());

  if (errorDescription) {
    console.log('errorDescription', errorDescription);
  }

  return {challengeId, errorCode};
}

interface SignInWithOtpInput {
  challengeId: string;
  verificationCode: string;
}

export async function signInWithOtp(input: SignInWithOtpInput) {
  const response = await fetch(`${url}/sign-in/otp`, {
    method: 'POST',
    body: JSON.stringify({...input, deviceId}),
  }).then(res => res.json());

  const {isVerified, challengeId, accessToken, refreshToken} = response;

  if (accessToken && refreshToken) {
    await setAccessToken(accessToken);
    await setRefreshToken(refreshToken);
  }

  return {
    isVerified,
    challengeId,
  };
}

export async function signInWithToken(token: string): Promise<void> {
  const response = await fetch(`${url}/sign-in/token`, {
    method: 'POST',
    body: JSON.stringify({token}),
  }).then(res => res.json());

  if (!response.accessToken || !response.refreshToken) {
    throw new Error('Sign-in failed.');
  }

  await setAccessToken(response.accessToken);
  await setRefreshToken(response.refreshToken);
}

export async function signOut(): Promise<void> {
  const accessToken = await getAccessToken();

  await fetch(`${url}/sign-out`, {
    method: 'POST',
    body: JSON.stringify({accessToken}),
  });

  await clearAccessToken();
  await clearRefreshToken();
}

interface InitWhatsAppRegistrationInput {
  phoneNumber: string;
}

export async function initWhatsAppRegistration(input: InitWhatsAppRegistrationInput) {
  const {challengeId} = await fetchWithAuth(`${url}/register/whatsapp`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return {challengeId};
}

interface FinishWhatsAppRegistrationInput {
  challengeId: string;
  verificationCode: string;
}

export async function finishWhatsAppRegistration(input: FinishWhatsAppRegistrationInput) {
  const {isVerified} = await fetchWithAuth(`${url}/register/whatsapp/verify`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return {isVerified};
}

export async function initPasskeyRegistration() {
  const response = await fetchWithAuth(`${url}/register/passkey`, {method: 'POST'});

  await authsignal.setToken(response.token);
}

export async function initPushRegistration() {
  const response = await fetchWithAuth(`${url}/register/push`, {method: 'POST'});

  await authsignal.setToken(response.token);
}

export async function initInAppRegistration() {
  const response = await fetchWithAuth(`${url}/register/in-app`, {method: 'POST'});

  await authsignal.setToken(response.token);
}

export async function getUserProfile() {
  return await fetchWithAuth(`${url}/profile`, {method: 'GET'});
}

async function fetchWithAuth(path: string, init: RequestInit): Promise<any> {
  const accessToken = await getAccessToken();

  init.headers = {
    ...init.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(path, init);

  if (response.status === 401 || response.status === 403) {
    const refreshResponse = await refreshSession();

    await setAccessToken(refreshResponse.accessToken);
    await setRefreshToken(refreshResponse.refreshToken);

    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${refreshResponse.accessToken}`,
    };

    console.log('Session refreshed successfully. Retrying request...');

    const responseAfterRefresh = await fetch(path, init);

    if (!responseAfterRefresh.ok) {
      handleError(responseAfterRefresh);
    }

    console.log('Request succeeded with fresh access token.');

    return responseAfterRefresh.json();
  } else if (!response.ok) {
    await handleError(response);
  }

  return response.json();
}

async function handleError(response: Response) {
  const json = await response.json();

  throw new Error(json.message ?? 'An error occurred');
}

async function refreshSession() {
  const refreshToken = await getRefreshToken();

  const response = await fetch(`${url}/sign-in/refresh`, {
    method: 'POST',
    body: JSON.stringify({refreshToken}),
  }).then(res => res.json());

  if (!response.accessToken || !response.refreshToken) {
    throw new Error('Refresh session failed.');
  }

  return response;
}

const ACCESS_TOKEN_KEY = '@access_token';
const ACCESS_TOKEN_OPTS = {service: ACCESS_TOKEN_KEY};
const REFRESH_TOKEN_KEY = '@refresh_token';
const REFRESH_TOKEN_OPTS = {service: REFRESH_TOKEN_KEY};

async function setAccessToken(token: string) {
  await Keychain.setGenericPassword(ACCESS_TOKEN_KEY, token, ACCESS_TOKEN_OPTS);
}

async function setRefreshToken(token: string) {
  await Keychain.setGenericPassword(REFRESH_TOKEN_KEY, token, REFRESH_TOKEN_OPTS);
}

export async function getAccessToken() {
  const credentials = await Keychain.getGenericPassword(ACCESS_TOKEN_OPTS);

  return credentials ? credentials.password : undefined;
}

export async function getRefreshToken() {
  const credentials = await Keychain.getGenericPassword(REFRESH_TOKEN_OPTS);

  return credentials ? credentials.password : undefined;
}

export async function clearAccessToken() {
  await Keychain.resetGenericPassword(ACCESS_TOKEN_OPTS);
}

export async function clearRefreshToken() {
  await Keychain.resetGenericPassword(REFRESH_TOKEN_OPTS);
}
