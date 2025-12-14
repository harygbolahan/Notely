import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext.jsx';

export default function FormattingToolbar({ onInsert, onFormat }) {
  const { isDark } = useTheme();

  const buttons = [
    { icon: '𝐁', action: 'bold', label: 'Bold' },
    { icon: '𝐼', action: 'italic', label: 'Italic' },
    { icon: 'S̶', action: 'strikethrough', label: 'Strike' },
    { icon: 'H1', action: 'h1', label: 'Heading 1' },
    { icon: 'H2', action: 'h2', label: 'Heading 2' },
    { icon: '•', action: 'bullet', label: 'Bullet' },
    { icon: '1.', action: 'numbered', label: 'Numbered' },
    { icon: '☐', action: 'checkbox', label: 'Checkbox' },
    { icon: '{ }', action: 'code', label: 'Code' },
    { icon: '—', action: 'divider', label: 'Divider' },
    { icon: '📅', action: 'date', label: 'Date' },
    { icon: '🕐', action: 'time', label: 'Time' },
  ];

  return (
    <View className={`border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="px-2 py-2"
      >
        {buttons.map((btn, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              if (['bold', 'italic', 'strikethrough'].includes(btn.action)) {
                onFormat(btn.action);
              } else {
                onInsert(btn.action);
              }
            }}
            className={`px-4 py-2 mx-1 rounded-xl ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-sm ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {btn.icon}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
