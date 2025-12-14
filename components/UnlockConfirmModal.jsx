import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext.jsx';

export default function UnlockConfirmModal({ visible, onClose, onConfirm }) {
  const { isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className={`w-full max-w-sm rounded-3xl p-6 ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}>
          {/* Icon */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-blue-500/20 items-center justify-center">
              <Text className="text-4xl">🔓</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={{ fontFamily: 'Inter_700Bold' }} className={`text-2xl text-center mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Unlock Note?
          </Text>

          {/* Message */}
          <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-base text-center mb-6 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Remove PIN protection from this note? Anyone will be able to view it.
          </Text>

          {/* Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={onConfirm}
              className="bg-blue-500 py-4 rounded-2xl"
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-white text-center text-base">
                Unlock Note
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className={`py-4 rounded-2xl ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-center text-base ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
