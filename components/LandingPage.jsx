import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

export const LandingPage = () => {
  return (
    <View className="flex-1 bg-gradient-to-b from-blue-50 to-white items-center justify-center px-6">
      <View className="items-center mb-8">
        <Text className="text-5xl font-bold text-gray-900 mb-4">Notely</Text>
        <Text className="text-xl text-gray-600 text-center">
          Your simple and elegant note-taking app
        </Text>
      </View>

      <View className="w-full max-w-md mt-8">
        <TouchableOpacity className="bg-blue-600 py-4 px-8 rounded-lg mb-4 items-center shadow-lg">
          <Text className="text-white text-lg font-semibold">Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-white border-2 border-blue-600 py-4 px-8 rounded-lg items-center">
          <Text className="text-blue-600 text-lg font-semibold">Learn More</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-12 items-center">
        <Text className="text-gray-500 text-sm">
          Capture your thoughts, organize your life
        </Text>
      </View>
    </View>
  );
};
