import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext.jsx';
import { isPinSet, removePin } from '../utils/pinSecurity';
import PinUnlockModal from '../components/PinUnlockModal.jsx';
import { resetDatabase } from '../utils/resetDatabase';

export default function SettingsScreen({ navigation }) {
  const { isDark, toggleTheme } = useTheme();
  const [hasPinSet, setHasPinSet] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinModalMode, setPinModalMode] = useState('setup');

  useEffect(() => {
    checkPinStatus();
  }, []);

  const checkPinStatus = async () => {
    const pinExists = await isPinSet();
    setHasPinSet(pinExists);
  };

  const handleChangePin = () => {
    setPinModalMode('setup');
    setShowPinModal(true);
  };

  const handleRemovePin = () => {
    Alert.alert(
      'Remove PIN',
      'This will remove PIN protection from all locked notes. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await removePin();
            if (success) {
              setHasPinSet(false);
              Alert.alert('Success', 'PIN has been removed');
            }
          },
        },
      ]
    );
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
    checkPinStatus();
  };

  const SettingItem = ({ icon, title, subtitle, onPress, danger, rightElement }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`p-5 rounded-2xl mb-3 border ${
        isDark 
          ? 'bg-gray-800/50 border-gray-700/50' 
          : 'bg-white border-gray-100'
      }`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
          danger ? 'bg-red-500/10' : 'bg-blue-500/10'
        }`}>
          <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-2xl">{icon}</Text>
        </View>
        <View className="flex-1">
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-base  mb-1 ${
            danger ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {subtitle}
          </Text>
        </View>
        {rightElement}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <View className={`px-6 pb-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className={`p-3 rounded-2xl mr-3 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-xl">←</Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Inter_700Bold' }} className={`text-4xl  ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Settings
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-xs  mb-3 tracking-wider ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            APPEARANCE
          </Text>
          
          <SettingItem
            icon={isDark ? '🌙' : '☀️'}
            title="Dark Mode"
            subtitle={isDark ? 'Dark theme enabled' : 'Light theme enabled'}
            onPress={toggleTheme}
            rightElement={
              <View className={`w-14 h-8 rounded-full p-1 ${
                isDark ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                <View className={`w-6 h-6 rounded-full bg-white ${
                  isDark ? 'ml-auto' : ''
                }`} />
              </View>
            }
          />
        </View>

        {/* Security Section */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-xs  mb-3 tracking-wider ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            SECURITY
          </Text>
          
          {hasPinSet ? (
            <>
              <SettingItem
                icon="🔑"
                title="Change PIN"
                subtitle="Update your 4-digit PIN"
                onPress={handleChangePin}
              />

              <SettingItem
                icon="🔓"
                title="Remove PIN"
                subtitle="Delete PIN and unlock all notes"
                onPress={handleRemovePin}
                danger
              />
            </>
          ) : (
            <SettingItem
              icon="🔒"
              title="Set PIN"
              subtitle="Create a 4-digit PIN to protect notes"
              onPress={handleChangePin}
            />
          )}
        </View>

        {/* About Section */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-xs  mb-3 tracking-wider ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            ABOUT
          </Text>
          
          <View className={`p-5 rounded-2xl border ${
            isDark 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white border-gray-100'
          }`}>
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-blue-500 rounded-2xl items-center justify-center mr-4">
                <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-4xl">📝</Text>
              </View>
              <View>
                <Text style={{ fontFamily: 'Inter_700Bold' }} className={`text-xl ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Notely
                </Text>
                <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Version 1.0.0
                </Text>
              </View>
            </View>
            <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-sm leading-5 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              A simple offline note-taking app with PIN protection for your private thoughts.
            </Text>
          </View>
        </View>

        {/* Privacy Notice */}
        <View className={`p-5 rounded-2xl mb-6 border ${
          isDark 
            ? 'bg-blue-900/10 border-blue-800/30' 
            : 'bg-blue-50 border-blue-100'
        }`}>
          <View className="flex-row mb-3">
            <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-2xl mr-2">ℹ️</Text>
            <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-sm flex-1 ${
              isDark ? 'text-blue-400' : 'text-blue-900'
            }`}>
              Privacy First
            </Text>
          </View>
          <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-sm leading-5 mb-2 ${
            isDark ? 'text-blue-300' : 'text-blue-800'
          }`}>
            • All notes stored locally on your device
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-sm leading-5 mb-2 ${
            isDark ? 'text-blue-300' : 'text-blue-800'
          }`}>
            • No internet required, works offline
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-sm leading-5 ${
            isDark ? 'text-blue-300' : 'text-blue-800'
          }`}>
            • No data collection or cloud sync
          </Text>
        </View>

        {/* Warning */}
        <View className={`p-5 rounded-2xl mb-6 border ${
          isDark 
            ? 'bg-yellow-900/10 border-yellow-800/30' 
            : 'bg-yellow-50 border-yellow-100'
        }`}>
          <View className="flex-row">
            <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-2xl mr-2">⚠️</Text>
            <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-sm leading-5 flex-1 ${
              isDark ? 'text-yellow-400' : 'text-yellow-800'
            }`}>
              If you forget your PIN, locked notes cannot be recovered. Please remember your PIN.
            </Text>
          </View>
        </View>

        {/* Debug Section */}
        {/* <View className="mb-8">
          <Text style={{ fontFamily: 'Inter_700Bold' }} className={`text-xs mb-3 tracking-wider ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            DEBUG
          </Text>
          
          <SettingItem
            icon="🗑️"
            title="Reset Database"
            subtitle="Delete all notes and fix database issues"
            onPress={() => {
              Alert.alert(
                'Reset Database',
                'This will delete ALL notes and reset the database. This action cannot be undone!',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                      const success = await resetDatabase();
                      if (success) {
                        Alert.alert('Success', 'Database has been reset. Please restart the app.');
                      } else {
                        Alert.alert('Error', 'Failed to reset database');
                      }
                    },
                  },
                ]
              );
            }}
            danger
          />

          <SettingItem
            icon="🔄"
            title="Show Onboarding"
            subtitle="View the welcome tutorial again"
            onPress={async () => {
              const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
              await AsyncStorage.removeItem('hasCompletedOnboarding');
              Alert.alert('Success', 'Please restart the app to see onboarding.');
            }}
          />
        </View> */}
      </ScrollView>

      {/* PIN Modal */}
      <PinUnlockModal
        visible={showPinModal}
        mode={pinModalMode}
        onSuccess={handlePinSuccess}
        onCancel={() => setShowPinModal(false)}
      />
    </SafeAreaView>
  );
}
