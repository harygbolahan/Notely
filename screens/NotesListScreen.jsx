import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext.jsx';
import { getAllNotes, searchNotes, deleteNote } from '../utils/database';

const { height } = Dimensions.get('window');

export default function NotesListScreen({ navigation }) {
  const { isDark } = useTheme();
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const loadNotes = async () => {
    try {
      const allNotes = await getAllNotes();
      setNotes(allNotes || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes([]);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setIsSearching(false);
      loadNotes();
    } else {
      setIsSearching(true);
      const results = await searchNotes(query);
      setNotes(results);
    }
  };

  const handleDeleteNote = (id, title) => {
    setNoteToDelete({ id, title });
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (noteToDelete) {
      await deleteNote(noteToDelete.id);
      setDeleteModalVisible(false);
      setNoteToDelete(null);
      loadNotes();
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setNoteToDelete(null);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderNoteItem = ({ item, index }) => {
    const isNoteLocked = Number(item.isLocked) === 1;
    const displayTitle = isNoteLocked ? 'Locked Note' : (item.title || 'Untitled');
    const preview = isNoteLocked
      ? 'This note is PIN-protected' 
      : (item.content || '').substring(0, 80);

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(400)}
      >
        <View className={`flex-row items-center mb-3`}>
          <TouchableOpacity
            onPress={() => navigation.navigate('NoteDetail', { noteId: item.id })}
            className={`flex-1 p-5 rounded-2xl border ${
              isDark 
                ? 'bg-gray-800/50 border-gray-700/50' 
                : 'bg-white border-gray-100'
            }`}
            activeOpacity={0.7}
          >
            <View className="flex-row justify-between items-start mb-3">
              <Text
                style={{ fontFamily: 'Inter_600SemiBold' }}
                className={`text-lg font-semibold flex-1 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
                numberOfLines={1}
              >
                {displayTitle}
              </Text>
              {isNoteLocked && (
                <View className="ml-3 bg-blue-500/20 px-3 py-1 rounded-full">
                  <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-blue-500 text-xs font-medium">🔒 Locked</Text>
                </View>
              )}
            </View>
            <Text
              style={{ fontFamily: 'Inter_400Regular' }}
              className={`text-sm mb-3 leading-5 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
              numberOfLines={2}
            >
              {preview}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-xs ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {formatDate(item.updatedAt)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleDeleteNote(item.id, displayTitle)}
            className={`ml-3 p-3 rounded-2xl ${
              isDark ? 'bg-red-700' : 'bg-red-500'
            }`}
            activeOpacity={0.7}
          >
            <Text className="text-xl">🗑️</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 mt-5 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <View className={`px-6 pb-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text style={{ fontFamily: 'Inter_700Bold' }} className={`text-4xl  ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notely
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            className={`p-3 rounded-2xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <Text className="text-2xl">⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className={`flex-row items-center px-4 py-3 rounded-2xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <Text className="text-xl mr-2">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search notes..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            style={{ fontFamily: 'Inter_400Regular' }}
            className={`flex-1 text-base ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          />
        </View>
      </View>

      {/* Notes List */}
      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => String(item?.id || Math.random())}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <Animated.View 
            entering={FadeIn.duration(400)}
            className="items-center justify-center py-24"
          >
            <View className="w-24 h-24 bg-blue-500/10 rounded-full items-center justify-center mb-4">
              <Text className="text-5xl">📝</Text>
            </View>
            <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-xl font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {isSearching ? 'No notes found' : 'No notes yet'}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {isSearching ? 'Try a different search' : 'Tap the + button to create your first note'}
            </Text>
          </Animated.View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('NoteDetail', { noteId: null })}
        className="absolute bottom-8 right-6 bg-blue-500 w-16 h-16 rounded-2xl items-center justify-center"
        style={{
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Text className="text-white text-4xl font-light leading-none">+</Text>
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        visible={deleteModalVisible}
        noteTitle={noteToDelete?.title}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}

function DeleteModal({ visible, noteTitle, onConfirm, onCancel, isDark }) {
  const translateY = useSharedValue(height);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      translateY.value = withTiming(height, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleCancel = () => {
    translateY.value = withTiming(height, { duration: 300 }, () => {
      runOnJS(onCancel)();
    });
  };

  const handleConfirm = () => {
    translateY.value = withTiming(height, { duration: 300 }, () => {
      runOnJS(onConfirm)();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 bg-black/60">
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={handleCancel}
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
            {/* Icon */}
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-red-500/10 rounded-full items-center justify-center">
                <Text className="text-4xl">🗑️</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={{ fontFamily: 'Inter_700Bold' }} className={`text-2xl text-center mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Delete Note
            </Text>
            
            <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-base text-center mb-8 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Are you sure you want to delete "{noteTitle}"? This action cannot be undone.
            </Text>

            {/* Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleConfirm}
                className="bg-red-500 py-4 rounded-2xl mb-3"
                activeOpacity={0.8}
              >
                <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-white text-center text-base font-semibold">
                  Delete
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancel}
                className={`py-4 rounded-2xl ${
                  isDark ? 'bg-gray-800' : 'bg-gray-100'
                }`}
                activeOpacity={0.8}
              >
                <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-center text-base font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
