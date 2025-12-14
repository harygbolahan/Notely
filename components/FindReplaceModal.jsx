import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext.jsx';

export default function FindReplaceModal({ visible, onClose, onFind, onReplace, onReplaceAll }) {
  const { isDark } = useTheme();
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center mb-4">
            <Text style={{ fontFamily: 'Inter_700Bold' }} className={`text-2xl ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Find & Replace
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-sm mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Find:
            </Text>
            <TextInput
              value={findText}
              onChangeText={setFindText}
              placeholder="Search text..."
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              className={`px-4 py-3 rounded-xl ${
                isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
              }`}
              style={{ fontFamily: 'Inter_400Regular' }}
            />
          </View>

          <View className="mb-4">
            <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-sm mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Replace with:
            </Text>
            <TextInput
              value={replaceText}
              onChangeText={setReplaceText}
              placeholder="Replacement text..."
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              className={`px-4 py-3 rounded-xl ${
                isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
              }`}
              style={{ fontFamily: 'Inter_400Regular' }}
            />
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => onFind(findText)}
              className={`flex-1 py-3 rounded-xl ${
                isDark ? 'bg-gray-800' : 'bg-gray-200'
              }`}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-center ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Find
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onReplace(findText, replaceText)}
              className="flex-1 bg-blue-500 py-3 rounded-xl"
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-white text-center">
                Replace
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onReplaceAll(findText, replaceText)}
              className="flex-1 bg-blue-600 py-3 rounded-xl"
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-white text-center">
                All
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
