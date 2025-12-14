import * as SecureStore from 'expo-secure-store';

const PIN_KEY = 'notely_pin_hash';

/**
 * Simple hash function for PIN (NOT cryptographic encryption)
 * This provides basic PIN protection only
 */
const hashPin = (pin) => {
  let hash = 0;
  const str = `notely_${pin}_salt`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

/**
 * Check if a PIN has been set
 */
export const isPinSet = async () => {
  try {
    const storedHash = await SecureStore.getItemAsync(PIN_KEY);
    // Explicitly return boolean, not string
    return storedHash !== null && storedHash !== undefined;
  } catch (error) {
    console.error('Error checking PIN:', error);
    return false;
  }
};

/**
 * Set a new PIN (stores hash only)
 */
export const setPin = async (pin) => {
  try {
    const hash = hashPin(pin);
    await SecureStore.setItemAsync(PIN_KEY, hash);
    return true;
  } catch (error) {
    console.error('Error setting PIN:', error);
    return false;
  }
};

/**
 * Verify if entered PIN matches stored hash
 */
export const verifyPin = async (pin) => {
  try {
    const storedHash = await SecureStore.getItemAsync(PIN_KEY);
    if (!storedHash) return false;
    
    const enteredHash = hashPin(pin);
    return storedHash === enteredHash;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};

/**
 * Remove the stored PIN
 */
export const removePin = async () => {
  try {
    await SecureStore.deleteItemAsync(PIN_KEY);
    return true;
  } catch (error) {
    console.error('Error removing PIN:', error);
    return false;
  }
};
