import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext.jsx';

const TEMPLATES = [
  {
    name: 'Meeting Notes',
    icon: '📝',
    content: `# Meeting Notes

**Date:** [Date]
**Attendees:** [Names]

## Agenda
- 

## Discussion Points
- 

## Action Items
- [ ] 

## Next Steps
- `,
  },
  {
    name: 'To-Do List',
    icon: '✅',
    content: `# To-Do List

## Today
- [ ] 
- [ ] 
- [ ] 

## This Week
- [ ] 
- [ ] 

## Later
- [ ] `,
  },
  {
    name: 'Journal Entry',
    icon: '📔',
    content: `# Journal Entry

**Date:** [Date]

## How I'm Feeling
[Your thoughts here]

## Today's Highlights
- 
- 
- 

## Gratitude
- 
- 
- 

## Tomorrow's Goals
- `,
  },
  {
    name: 'Project Plan',
    icon: '🎯',
    content: `# Project Plan

## Overview
[Brief description]

## Goals
- 
- 

## Timeline
- **Phase 1:** 
- **Phase 2:** 
- **Phase 3:** 

## Resources Needed
- 
- 

## Success Metrics
- `,
  },
  {
    name: 'Book Notes',
    icon: '📚',
    content: `# Book Notes

**Title:** [Book Title]
**Author:** [Author Name]
**Date Started:** [Date]

## Key Takeaways
- 
- 
- 

## Favorite Quotes
> 

## My Thoughts
[Your reflections]

## Action Items
- [ ] `,
  },
  {
    name: 'Recipe',
    icon: '🍳',
    content: `# Recipe Name

**Prep Time:** [Time]
**Cook Time:** [Time]
**Servings:** [Number]

## Ingredients
- 
- 
- 

## Instructions
1. 
2. 
3. 

## Notes
- `,
  },
];

export default function TemplateSelector({ visible, onClose, onSelect }) {
  const { isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className={`rounded-t-3xl p-6 max-h-[80%] ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center mb-4">
            <Text style={{ fontFamily: 'Inter_700Bold' }} className={`text-2xl ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Choose Template
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {TEMPLATES.map((template, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  onSelect(template);
                  onClose();
                }}
                className={`p-4 rounded-2xl mb-3 flex-row items-center ${
                  isDark ? 'bg-gray-800' : 'bg-gray-100'
                }`}
              >
                <Text className="text-3xl mr-4">{template.icon}</Text>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-base mb-1 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {template.name}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Tap to use this template
                  </Text>
                </View>
                <Text className="text-xl">→</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
