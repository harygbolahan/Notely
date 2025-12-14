import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext.jsx';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    emoji: '📝',
    title: 'Create Notes',
    description: 'Capture your thoughts, ideas, and reminders in a clean, distraction-free environment',
  },
  {
    id: '2',
    emoji: '🔒',
    title: 'Secure with PIN',
    description: 'Protect your private notes with a 4-digit PIN. Your data stays safe and private',
  },
  {
    id: '3',
    emoji: '🔍',
    title: 'Quick Search',
    description: 'Find any note instantly with powerful search. All your notes, always accessible',
  },
  {
    id: '4',
    emoji: '📱',
    title: 'Offline First',
    description: 'Everything stored locally on your device. No internet required, no data collection',
  },
];

export default function OnboardingScreen({ onComplete }) {
  const { isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderSlide = ({ item }) => (
    <View style={{ width }} className="items-center justify-center px-8 ">
      <View className="w-32 h-32 bg-blue-500 rounded-full items-center justify-center mb-8">
        <Text className="text-7xl">{item.emoji}</Text>
      </View>
      <Text style={{ fontFamily: 'Inter_700Bold' }} className={`text-3xl  text-center mb-4 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {item.title}
      </Text>
      <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-base text-center leading-6 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {item.description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 mt-5 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity
          onPress={handleSkip}
          className="absolute top-4 right-6 z-10 py-2 px-4"
        >
          <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-base ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Skip
          </Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />

      {/* Pagination Dots */}
      <View className="flex-row justify-center mb-8">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full mx-1 ${
              index === currentIndex
                ? 'w-8 bg-blue-500'
                : isDark
                ? 'w-2 bg-gray-700'
                : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </View>

      {/* Next/Get Started Button */}
      <View className="px-8 pb-8">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-blue-500 py-4 rounded-2xl items-center"
        >
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-white text-lg font-semibold">
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
