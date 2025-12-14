import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext.jsx';

const PRESET_TAGS = [
  { name: 'Work', color: '#3B82F6' },
  { name: 'Personal', color: '#10B981' },
  { name: 'Ideas', color: '#F59E0B' },
  { name: 'Important', color: '#EF4444' },
  { name: 'Todo', color: '#8B5CF6' },
  { name: 'Meeting', color: '#06B6D4' },
];

export default function TagSelector({ visible, selectedTags = [], onClose, onSave }) {
  const { isDark } = useTheme();
  const [tags, setTags] = useState(selectedTags);
  const [customTag, setCustomTag] = useState('');

  const toggleTag = (tagName) => {
    if (tags.includes(tagName)) {
      setTags(tags.filter(t => t !== tagName));
    } else {
      setTags([...tags, tagName]);
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSave = () => {
    onSave(tags);
    onClose();
  };

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
              Add Tags
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-96">
            <View className="flex-row flex-wrap gap-2 mb-4">
              {PRESET_TAGS.map((tag, index) => {
                const isSelected = tags.includes(tag.name);
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleTag(tag.name)}
                    className="px-4 py-2 rounded-full"
                    style={{
                      backgroundColor: isSelected ? tag.color : isDark ? '#374151' : '#F3F4F6',
                    }}
                  >
                    <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-sm ${
                      isSelected ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {tag.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {tags.filter(t => !PRESET_TAGS.find(p => p.name === t)).length > 0 && (
              <View className="mb-4">
                <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-sm mb-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Custom Tags:
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {tags.filter(t => !PRESET_TAGS.find(p => p.name === t)).map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full ${
                        isDark ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                    >
                      <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-sm ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {tag} ✕
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View className="mb-4">
              <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-sm mb-2 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Add Custom Tag:
              </Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={customTag}
                  onChangeText={setCustomTag}
                  placeholder="Enter tag name"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  className={`flex-1 px-4 py-3 rounded-xl ${
                    isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                  style={{ fontFamily: 'Inter_400Regular' }}
                  onSubmitEditing={addCustomTag}
                />
                <TouchableOpacity
                  onPress={addCustomTag}
                  className="bg-blue-500 px-4 py-3 rounded-xl"
                >
                  <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-white">
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={handleSave}
            className="bg-blue-500 py-4 rounded-2xl mt-4"
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-white text-center text-base">
              Save Tags
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
