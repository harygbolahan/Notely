/**
 * Text formatting utilities for markdown-style formatting
 */

export const formatText = (text, selection, formatType) => {
  const start = selection?.start || 0;
  const end = selection?.end || start;
  const selectedText = text.substring(start, end);
  
  let formattedText = '';
  let newCursorPos = start;

  switch (formatType) {
    case 'bold':
      if (selectedText) {
        formattedText = `**${selectedText}**`;
        newCursorPos = end + 4;
      } else {
        formattedText = '****';
        newCursorPos = start + 2;
      }
      break;
    case 'italic':
      if (selectedText) {
        formattedText = `*${selectedText}*`;
        newCursorPos = end + 2;
      } else {
        formattedText = '**';
        newCursorPos = start + 1;
      }
      break;
    case 'strikethrough':
      if (selectedText) {
        formattedText = `~~${selectedText}~~`;
        newCursorPos = end + 4;
      } else {
        formattedText = '~~~~';
        newCursorPos = start + 2;
      }
      break;
    default:
      formattedText = selectedText;
      newCursorPos = end;
  }

  const newText = text.substring(0, start) + formattedText + text.substring(end);
  return { newText, newCursorPos };
};

export const insertText = (text, cursorPosition, insertType) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const pos = cursorPosition || 0;
  let insertedText = '';
  let cursorOffset = 0;

  // Check if we're at the start of a line or need a newline
  const needsNewline = pos > 0 && text[pos - 1] !== '\n';

  switch (insertType) {
    case 'h1':
      insertedText = needsNewline ? '\n# ' : '# ';
      cursorOffset = insertedText.length;
      break;
    case 'h2':
      insertedText = needsNewline ? '\n## ' : '## ';
      cursorOffset = insertedText.length;
      break;
    case 'bullet':
      insertedText = needsNewline ? '\n- ' : '- ';
      cursorOffset = insertedText.length;
      break;
    case 'numbered':
      insertedText = needsNewline ? '\n1. ' : '1. ';
      cursorOffset = insertedText.length;
      break;
    case 'checkbox':
      insertedText = needsNewline ? '\n- [ ] ' : '- [ ] ';
      cursorOffset = insertedText.length;
      break;
    case 'code':
      insertedText = needsNewline ? '\n```\n\n```\n' : '```\n\n```\n';
      cursorOffset = needsNewline ? 5 : 4;
      break;
    case 'divider':
      insertedText = needsNewline ? '\n---\n' : '---\n';
      cursorOffset = insertedText.length;
      break;
    case 'date':
      insertedText = dateStr;
      cursorOffset = insertedText.length;
      break;
    case 'time':
      insertedText = timeStr;
      cursorOffset = insertedText.length;
      break;
    default:
      insertedText = '';
  }

  const newText = text.substring(0, pos) + insertedText + text.substring(pos);
  return { newText, newCursorPos: pos + cursorOffset };
};

export const findInText = (text, searchTerm) => {
  if (!searchTerm) return [];
  
  const matches = [];
  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();
  let index = lowerText.indexOf(lowerSearch);
  
  while (index !== -1) {
    matches.push({ start: index, end: index + searchTerm.length });
    index = lowerText.indexOf(lowerSearch, index + 1);
  }
  
  return matches;
};

export const replaceInText = (text, searchTerm, replaceTerm, replaceAll = false) => {
  if (!searchTerm) return text;
  
  if (replaceAll) {
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return text.replace(regex, replaceTerm);
  } else {
    const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index === -1) return text;
    return text.substring(0, index) + replaceTerm + text.substring(index + searchTerm.length);
  }
};

export const calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};
