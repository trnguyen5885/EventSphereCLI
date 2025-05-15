import * as Keychain from 'react-native-keychain';

export const saveTokens = async (accessToken, refreshToken) => {
    await Keychain.setGenericPassword('token', JSON.stringify({ accessToken, refreshToken }));
}

export const getTokens = async () => {
    const creds = await Keychain.getGenericPassword();
    if (creds) return JSON.parse(creds.password);
    return null
}

export const deleteTokens = async () => {
    await Keychain.resetGenericPassword();
};