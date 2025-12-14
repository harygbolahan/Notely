import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS 
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext.jsx';
import { verifyPin, setPin } from '../utils/pinSecurity';

const { height } = Dimensions.get('window');

export default function PinUnlockModal({ visible, mode = 'unlock', onSuccess, onCancel }) {
  const { isDark } = useTheme();
  const [pin, setLocalPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  
  const translateY = useSharedValue(height);

  useEffect(() => {
    if (visible) {
      resetState();
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      translateY.value = withTiming(height, { duration: 300 });
    }
  }, [visible]);

  const resetState = () => {
    setLocalPin('');
    setConfirmPin('');
    setStep(1);
    setError('');
  };

  const handleClose = () => {
    translateY.value = withTiming(height, { duration: 300 }, () => {
      runOnJS(onCancel)();
    });
  };

  const handleNumberPress = (num) => {
    setError('');
    
    if (mode === 'setup' && step === 2) {
      if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + num;
        setConfirmPin(newConfirmPin);
        
        if (newConfirmPin.length === 4) {
          validateSetup(pin, newConfirmPin);
        }
      }
    } else {
      if (pin.length < 4) {
        const newPin = pin + num;
        setLocalPin(newPin);
        
        if (newPin.length === 4) {
          if (mode === 'unlock') {
            validateUnlock(newPin);
          } else {
            setStep(2);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    setError('');
    if (mode === 'setup' && step === 2) {
      setConfirmPin(confirmPin.slice(0, -1));
    } else {
      setLocalPin(pin.slice(0, -1));
    }
  };

  const validateUnlock = async (enteredPin) => {
    const isValid = await verifyPin(enteredPin);
    if (isValid) {
      translateY.value = withTiming(height, { duration: 300 }, () => {
        runOnJS(onSuccess)();
      });
    } else {
      setError('Incorrect PIN');
      setLocalPin('');
    }
  };

  const validateSetup = async (newPin, confirmedPin) => {
    if (newPin === confirmedPin) {
      const success = await setPin(newPin);
      if (success) {
        translateY.value = withTiming(height, { duration: 300 }, () => {
          runOnJS(onSuccess)();
        });
      } else {
        setError('Failed to set PIN');
        resetState();
      }
    } else {
      setError('PINs do not match');
      setStep(1);
      setLocalPin('');
      setConfirmPin('');
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const renderPinDots = () => {
    const currentPin = (mode === 'setup' && step === 2) ? confirmPin : pin;
    return (
      <View className="flex-row justify-center mb-12">
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            className={`w-5 h-5 rounded-full mx-3 ${
              index < currentPin.length
                ? 'bg-blue-500'
                : isDark
                ? 'bg-gray-700'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', '⌫'],
    ];

    return (
      <View className="w-full px-8">
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row justify-between mb-4">
            {row.map((num, colIndex) => {
              if (num === '') {
                return <View key={colIndex} className="w-20 h-20" />;
              }
              
              const isBackspace = num === '⌫';
              
              return (
                <TouchableOpacity
                  key={colIndex}
                  onPress={() => isBackspace ? handleBackspace() : handleNumberPress(num)}
                  className={`w-20 h-20 rounded-2xl items-center justify-center ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontFamily: 'Inter_300Light' }} className={`text-3xl font-light ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {num}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const getTitle = () => {
    if (mode === 'setup') {
      return step === 1 ? 'Set PIN' : 'Confirm PIN';
    }
    return 'Enter PIN';
  };

  const getSubtitle = () => {
    if (mode === 'setup') {
      return step === 1 
        ? 'Create a 4-digit PIN to protect your notes'
        : 'Enter your PIN again to confirm';
    }
    return 'Enter your PIN to unlock this note';
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/60">
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={handleClose}
          className="flex-1"
        />
        
        <Animated.View
          style={[animatedStyle]}
          className={`rounded-t-3xl ${
            isDark ? 'bg-gray-900' : 'bg-white'
          }`}
        >
          {/* Drawer Handle */}
          <View className="items-center pt-3 pb-6">
            <View className={`w-12 h-1.5 rounded-full ${
              isDark ? 'bg-gray-700' : 'bg-gray-300'
            }`} />
          </View>

          {/* Content */}
          <View className="px-6 pb-8">
            {/* Title */}
            <Text style={{ fontFamily: 'Inter_700Bold' }} className={`text-3xl  text-center mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {getTitle()}
            </Text>
            
            <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-sm text-center mb-8 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {getSubtitle()}
            </Text>

            {/* Error Message */}
            {error ? (
              <View className="mb-4 p-3 rounded-xl bg-red-500/10">
                <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-red-500 text-center font-medium">{error}</Text>
              </View>
            ) : null}

            {/* PIN Dots */}
            {renderPinDots()}

            {/* Keypad */}
            {renderKeypad()}

            {/* Warning for setup mode */}
            {mode === 'setup' && step === 1 && (
              <View className={`mt-6 p-4 rounded-xl ${
                isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'
              }`}>
                <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-xs text-center leading-5 ${
                  isDark ? 'text-yellow-400' : 'text-yellow-800'
                }`}>
                  ⚠️ If you forget your PIN, locked notes cannot be recovered.
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
