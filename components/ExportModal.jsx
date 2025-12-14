import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext.jsx';
import { exportAsTextFile, exportAsMarkdown, exportAsHTML } from '../utils/exportUtils';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';

export default function ExportModal({ visible, onClose, title, content }) {
  const { isDark } = useTheme();

  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(`${title}\n\n${content}`);
      Alert.alert('Success', 'Note copied to clipboard');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const exportOptions = [
    {
      name: 'Plain Text (.txt)',
      icon: '📄',
      action: () => {
        exportAsTextFile(title, content);
        onClose();
      },
    },
    {
      name: 'Markdown (.md)',
      icon: '📝',
      action: () => {
        exportAsMarkdown(title, content);
        onClose();
      },
    },
    {
      name: 'HTML (.html)',
      icon: '🌐',
      action: () => {
        exportAsHTML(title, content);
        onClose();
      },
    },
    {
      name: 'Copy to Clipboard',
      icon: '📋',
      action: handleCopyToClipboard,
    },
  ];

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
              Export Note
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl">✕</Text>
            </TouchableOpacity>
          </View>

          {exportOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={option.action}
              className={`p-4 rounded-2xl mb-3 flex-row items-center ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}
            >
              <Text className="text-3xl mr-4">{option.icon}</Text>
              <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-base flex-1 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {option.name}
              </Text>
              <Text className="text-xl">→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}
