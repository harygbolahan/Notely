import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, Share, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext.jsx';
import { getNoteById, createNote, updateNote, deleteNote } from '../utils/database';
import { isPinSet } from '../utils/pinSecurity';
import PinUnlockModal from '../components/PinUnlockModal.jsx';
import TagSelector from '../components/TagSelector.jsx';
import TemplateSelector from '../components/TemplateSelector.jsx';
import FormattingToolbar from '../components/FormattingToolbar.jsx';
import FindReplaceModal from '../components/FindReplaceModal.jsx';
import ExportModal from '../components/ExportModal.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import UnlockConfirmModal from '../components/UnlockConfirmModal.jsx';
import { formatText, insertText, replaceInText, calculateReadingTime } from '../utils/textFormatting';

export default function NoteDetailScreen({ route, navigation }) {
  const { noteId } = route.params;
  const { isDark } = useTheme();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLocked, setIsLocked] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinModalMode, setPinModalMode] = useState('unlock');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [lastEdited, setLastEdited] = useState(null);
  const [tags, setTags] = useState([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(true);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [textSelection, setTextSelection] = useState({ start: 0, end: 0 });
  
  const autoSaveTimer = useRef(null);
  const latestDataRef = useRef({ title: '', content: '', tags: [] });
  const contentInputRef = useRef(null);
  const isNewNote = noteId === null;

  // Calculate word and character count
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = content.length;
  const readingTime = calculateReadingTime(content);

  useEffect(() => {
    if (!isNewNote) {
      loadNote();
    } else {
      setIsUnlocked(true);
    }
    
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
        // Force final save on unmount with latest data
        const { title: finalTitle, content: finalContent, tags: finalTags } = latestDataRef.current;
        if (finalTitle || finalContent) {
          saveNote(finalTitle, finalContent, isLocked, finalTags, true);
        }
      }
    };
  }, [noteId]);

  const loadNote = async () => {
    try {
      setIsLoading(true);
      const note = await getNoteById(noteId);
      if (note) {
        if (Number(note.isLocked) === 1) {
          setShowPinModal(true);
          setPinModalMode('unlock');
        } else {
          setTitle(note.title);
          setContent(note.content);
          setIsLocked(Number(note.isLocked));
          setTags(note.tags || []);
          setIsUnlocked(true);
          latestDataRef.current = { title: note.title, content: note.content, tags: note.tags || [] };
        }
      }
    } catch (error) {
      console.error('Error loading note:', error);
      Alert.alert('Error', 'Failed to load note');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinUnlockSuccess = async () => {
    setShowPinModal(false);
    setIsUnlocked(true);
    
    try {
      const note = await getNoteById(noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setIsLocked(Number(note.isLocked));
        setTags(note.tags || []);
        latestDataRef.current = { title: note.title, content: note.content, tags: note.tags || [] };
      }
    } catch (error) {
      console.error('Error loading note after unlock:', error);
      Alert.alert('Error', 'Failed to load note');
    }
  };

  const handlePinSetupSuccess = async () => {
    setShowPinModal(false);
    setIsLocked(1);
    await saveNote(title, content, 1, tags);
  };

  const saveNote = async (noteTitle, noteContent, lockStatus = isLocked, noteTags = tags, skipIndicator = false) => {
    try {
      if (!skipIndicator) {
        setIsSaving(true);
        setSaveError(null);
      }
      
      if (isNewNote) {
        const newId = await createNote(noteTitle, noteContent, lockStatus, noteTags);
        if (newId) {
          navigation.setParams({ noteId: newId });
        }
      } else {
        await updateNote(noteId, noteTitle, noteContent, lockStatus, noteTags);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveError('Failed to save');
    } finally {
      if (!skipIndicator) {
        setIsSaving(false);
      }
    }
  };

  const handleTextChange = (field, value) => {
    if (field === 'title') {
      setTitle(value);
      latestDataRef.current.title = value;
    } else {
      setContent(value);
      latestDataRef.current.content = value;
    }

    setLastEdited(new Date());

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    
    autoSaveTimer.current = setTimeout(async () => {
      // Use ref to get the latest values
      const { title: saveTitle, content: saveContent, tags: saveTags } = latestDataRef.current;
      await saveNote(saveTitle, saveContent, isLocked, saveTags);
    }, 1000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${title}\n\n${content}`,
        title: title || 'Note',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setShowDeleteModal(false);
      if (!isNewNote) {
        await deleteNote(noteId);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting note:', error);
      Alert.alert('Error', 'Failed to delete note');
    }
  };

  const handleConfirmUnlock = async () => {
    try {
      setShowUnlockModal(false);
      const { title: currentTitle, content: currentContent, tags: currentTags } = latestDataRef.current;
      setIsLocked(0);
      await saveNote(currentTitle, currentContent, 0, currentTags);
    } catch (error) {
      console.error('Error unlocking note:', error);
      Alert.alert('Error', 'Failed to unlock note');
    }
  };

  const handleDuplicate = async () => {
    try {
      const newId = await createNote(`${title} (Copy)`, content, 0, tags);
      if (newId) {
        Alert.alert('Success', 'Note duplicated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.replace('NoteDetail', { noteId: newId }),
          },
        ]);
      }
    } catch (error) {
      console.error('Error duplicating note:', error);
      Alert.alert('Error', 'Failed to duplicate note');
    }
  };

  const handleFormatText = (formatType) => {
    try {
      const result = formatText(content, textSelection, formatType);
      setContent(result.newText);
      latestDataRef.current.content = result.newText;
      
      // Update the TextInput selection
      if (contentInputRef.current) {
        setTimeout(() => {
          contentInputRef.current.setNativeProps({
            selection: { start: result.newCursorPos, end: result.newCursorPos }
          });
        }, 10);
      }
      
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      autoSaveTimer.current = setTimeout(async () => {
        await saveNote(title, result.newText, isLocked, tags);
      }, 1000);
    } catch (error) {
      console.error('Error formatting text:', error);
      Alert.alert('Error', 'Failed to format text');
    }
  };

  const handleInsertText = (insertType) => {
    try {
      const cursorPos = textSelection.start || 0;
      const result = insertText(content, cursorPos, insertType);
      setContent(result.newText);
      latestDataRef.current.content = result.newText;
      
      // Update cursor position after insert
      if (contentInputRef.current) {
        setTimeout(() => {
          contentInputRef.current.focus();
          contentInputRef.current.setNativeProps({
            selection: { start: result.newCursorPos, end: result.newCursorPos }
          });
        }, 10);
      }
      
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      autoSaveTimer.current = setTimeout(async () => {
        await saveNote(title, result.newText, isLocked, tags);
      }, 1000);
    } catch (error) {
      console.error('Error inserting text:', error);
      Alert.alert('Error', 'Failed to insert text');
    }
  };

  const handleFindText = (searchTerm) => {
    // Highlight functionality would require a more complex text component
    Alert.alert('Find', `Searching for: ${searchTerm}`);
  };

  const handleReplaceText = (searchTerm, replaceTerm) => {
    const newText = replaceInText(content, searchTerm, replaceTerm, false);
    setContent(newText);
    latestDataRef.current.content = newText;
    saveNote(title, newText, isLocked, tags);
  };

  const handleReplaceAllText = (searchTerm, replaceTerm) => {
    const newText = replaceInText(content, searchTerm, replaceTerm, true);
    setContent(newText);
    latestDataRef.current.content = newText;
    saveNote(title, newText, isLocked, tags);
  };

  const handleTemplateSelect = (template) => {
    setTitle(template.name);
    setContent(template.content);
    latestDataRef.current = { title: template.name, content: template.content, tags };
    saveNote(template.name, template.content, isLocked, tags);
  };

  const handleSaveTags = (newTags) => {
    setTags(newTags);
    latestDataRef.current.tags = newTags;
    saveNote(title, content, isLocked, newTags);
  };

  const handleToggleLock = async () => {
    try {
      // Save current content first
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      const { title: currentTitle, content: currentContent, tags: currentTags } = latestDataRef.current;
      await saveNote(currentTitle, currentContent, isLocked, currentTags);
      
      const hasPinSet = await isPinSet();
      
      if (isLocked === 1) {
        setShowUnlockModal(true);
      } else {
        if (!hasPinSet) {
          setPinModalMode('setup');
          setShowPinModal(true);
        } else {
          setIsLocked(1);
          await saveNote(currentTitle, currentContent, 1, currentTags);
        }
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
      Alert.alert('Error', 'Failed to update lock status');
    }
  };

  const handleBack = async () => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    const { title: finalTitle, content: finalContent, tags: finalTags } = latestDataRef.current;
    await saveNote(finalTitle, finalContent, isLocked, finalTags, true);
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <View className="flex-1 justify-center items-center">
          <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isNewNote && !isUnlocked) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <PinUnlockModal
          visible={showPinModal}
          mode={pinModalMode}
          onSuccess={handlePinUnlockSuccess}
          onCancel={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className={`px-6 pb-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <View className="flex-row justify-between items-center">
            <TouchableOpacity 
              onPress={handleBack} 
              className={`p-2 rounded-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <Text className="text-3xl"> ← </Text>
            </TouchableOpacity>
            
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleToggleLock}
                className={`px-5 py-3 rounded-2xl flex-row items-center ${
                  isLocked === 1 
                    ? 'bg-blue-500' 
                    : isDark 
                    ? 'bg-gray-800' 
                    : 'bg-white'
                }`}
              >
                <Text className="text-lg mr-2">{isLocked === 1 ? '🔒' : '🔓'}</Text>
                <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-sm ${
                  isLocked === 1 ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {isLocked === 1 ? 'Locked' : 'Lock'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowFormattingToolbar(!showFormattingToolbar)}
                className={`p-3 rounded-2xl mr-2 ${
                  showFormattingToolbar ? 'bg-blue-500' : isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <Text className={`text-lg ${showFormattingToolbar ? 'text-white' : ''}`}>✏️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowMoreMenu(!showMoreMenu)}
                className={`p-3 rounded-2xl ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <Text className="text-xl">⋮</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* More Menu Dropdown */}
          {showMoreMenu && (
            <View className={`mt-2 rounded-2xl overflow-hidden ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <TouchableOpacity
                onPress={() => {
                  setShowMoreMenu(false);
                  setShowTagSelector(true);
                }}
                className={`px-4 py-3 flex-row items-center border-b ${
                  isDark ? 'border-gray-700' : 'border-gray-100'
                }`}
              >
                <Text className="text-lg mr-3">🏷️</Text>
                <Text style={{ fontFamily: 'Inter_500Medium' }} className={`text-base ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Add Tags
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowMoreMenu(false);
                  setShowTemplateSelector(true);
                }}
                className={`px-4 py-3 flex-row items-center border-b ${
                  isDark ? 'border-gray-700' : 'border-gray-100'
                }`}
              >
                <Text className="text-lg mr-3">📋</Text>
                <Text style={{ fontFamily: 'Inter_500Medium' }} className={`text-base ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Use Template
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowMoreMenu(false);
                  setIsReadingMode(!isReadingMode);
                }}
                className={`px-4 py-3 flex-row items-center border-b ${
                  isDark ? 'border-gray-700' : 'border-gray-100'
                }`}
              >
                <Text className="text-lg mr-3">{isReadingMode ? '✏️' : '👁️'}</Text>
                <Text style={{ fontFamily: 'Inter_500Medium' }} className={`text-base ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {isReadingMode ? 'Edit Mode' : 'Reading Mode'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowMoreMenu(false);
                  setShowFindReplace(true);
                }}
                className={`px-4 py-3 flex-row items-center border-b ${
                  isDark ? 'border-gray-700' : 'border-gray-100'
                }`}
              >
                <Text className="text-lg mr-3">🔍</Text>
                <Text style={{ fontFamily: 'Inter_500Medium' }} className={`text-base ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Find & Replace
                </Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
                onPress={() => {
                  setShowMoreMenu(false);
                  setShowExportModal(true);
                }}
                className={`px-4 py-3 flex-row items-center border-b ${
                  isDark ? 'border-gray-700' : 'border-gray-100'
                }`}
              >
                <Text className="text-lg mr-3">💾</Text>
                <Text style={{ fontFamily: 'Inter_500Medium' }} className={`text-base ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Export Note
                </Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                onPress={() => {
                  setShowMoreMenu(false);
                  handleShare();
                }}
                className={`px-4 py-3 flex-row items-center border-b ${
                  isDark ? 'border-gray-700' : 'border-gray-100'
                }`}
              >
                <Text className="text-lg mr-3">📤</Text>
                <Text style={{ fontFamily: 'Inter_500Medium' }} className={`text-base ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Share Note
                </Text>
              </TouchableOpacity>

              {!isNewNote && (
                <TouchableOpacity
                  onPress={() => {
                    setShowMoreMenu(false);
                    handleDuplicate();
                  }}
                  className={`px-4 py-3 flex-row items-center border-b ${
                    isDark ? 'border-gray-700' : 'border-gray-100'
                  }`}
                >
                  <Text className="text-lg mr-3">📑</Text>
                  <Text style={{ fontFamily: 'Inter_500Medium' }} className={`text-base ${
                    isDark ? 'text-white' : 'text-gray-900'
                }`}>
                    Duplicate Note
                  </Text>
                </TouchableOpacity>
              )}

              {!isNewNote && (
                <TouchableOpacity
                  onPress={() => {
                    setShowMoreMenu(false);
                    handleDelete();
                  }}
                  className="px-4 py-3 flex-row items-center"
                >
                  <Text className="text-lg mr-3">🗑️</Text>
                  <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-base text-red-500">
                    Delete Note
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <View className="mt-3 flex-row flex-wrap gap-2">
              {tags.map((tag, index) => (
                <View
                  key={index}
                  className={`px-3 py-1 rounded-full ${
                    isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                  }`}
                >
                  <Text style={{ fontFamily: 'Inter_500Medium' }} className={`text-xs ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Metadata */}
          {(wordCount > 0 || lastEdited) && (
            <View className="mt-3">
              <View className="flex-row justify-between items-center">
                <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-xs ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} {charCount === 1 ? 'character' : 'characters'}
                  {readingTime > 0 && ` · ${readingTime} min read`}
                </Text>
                {lastEdited && (
                  <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-xs ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    Edited {lastEdited.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        <ScrollView 
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => {
            setShowMoreMenu(false);
            Keyboard.dismiss();
          }}
        >
          {/* Title Input */}
          <TextInput
            value={title}
            onChangeText={(text) => handleTextChange('title', text)}
            placeholder="Note title"
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            className={`text-3xl  mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
            style={{ paddingVertical: 8, fontFamily: 'Inter_700Bold' }}
          />

          {/* Divider */}
          <View className={`h-px mb-6 ${
            isDark ? 'bg-gray-800' : 'bg-gray-200'
          }`} />

          {/* Content Input or Reading View */}
          {isReadingMode ? (
            <View className="pb-8">
              <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-base leading-7 ${
                isDark ? 'text-gray-300' : 'text-gray-800'
              }`}>
                {content || 'No content yet'}
              </Text>
            </View>
          ) : (
            <TextInput
              ref={contentInputRef}
              value={content}
              onChangeText={(text) => handleTextChange('content', text)}
              onSelectionChange={(event) => setTextSelection(event.nativeEvent.selection)}
              placeholder="Start writing..."
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              multiline
              textAlignVertical="top"
              className={`text-base leading-7 ${
                isDark ? 'text-gray-300' : 'text-gray-800'
              }`}
              style={{ minHeight: 500, fontFamily: 'Inter_400Regular' }}
            />
          )}

          {/* Empty State Helper */}
          {!title && !content && (
            <View className="mt-8">
              <Text style={{ fontFamily: 'Inter_600SemiBold' }} className={`text-lg mb-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Quick Tips:
              </Text>
              <View className="space-y-2">
                <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-sm mb-2 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  • Tap the lock icon to protect sensitive notes
                </Text>
                <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-sm mb-2 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  • Your changes save automatically
                </Text>
                <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-sm ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  • Use the ⋮ menu to share or duplicate notes
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Auto-save indicator */}
        <View className={`px-6 py-3 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-xs text-center ${
            saveError ? 'text-red-500' : isDark ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {isSaving ? 'Saving...' : saveError || 'Changes saved automatically'}
          </Text>
        </View>

        {/* Formatting Toolbar */}
        {showFormattingToolbar && !isReadingMode && (
          <FormattingToolbar
            onInsert={handleInsertText}
            onFormat={handleFormatText}
          />
        )}
      </KeyboardAvoidingView>

      {/* PIN Modal */}
      <PinUnlockModal
        visible={showPinModal}
        mode={pinModalMode}
        onSuccess={pinModalMode === 'setup' ? handlePinSetupSuccess : handlePinUnlockSuccess}
        onCancel={() => setShowPinModal(false)}
      />

      {/* Tag Selector */}
      <TagSelector
        visible={showTagSelector}
        selectedTags={tags}
        onClose={() => setShowTagSelector(false)}
        onSave={handleSaveTags}
      />

      {/* Template Selector */}
      <TemplateSelector
        visible={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
      />

      {/* Find & Replace */}
      <FindReplaceModal
        visible={showFindReplace}
        onClose={() => setShowFindReplace(false)}
        onFind={handleFindText}
        onReplace={handleReplaceText}
        onReplaceAll={handleReplaceAllText}
      />

      {/* Export Modal */}
      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={title}
        content={content}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        noteTitle={title}
      />

      {/* Unlock Confirmation Modal */}
      <UnlockConfirmModal
        visible={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onConfirm={handleConfirmUnlock}
      />
    </SafeAreaView>
  );
}
