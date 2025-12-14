import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

/**
 * Export note as a text file
 */
export const exportAsTextFile = async (title, content) => {
  try {
    const fileName = `${title || 'Note'}.txt`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, `${title}\n\n${content}`, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert('Success', `Note saved to ${fileUri}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error exporting as text:', error);
    Alert.alert('Error', 'Failed to export note');
    return false;
  }
};

/**
 * Export note as markdown file
 */
export const exportAsMarkdown = async (title, content) => {
  try {
    const fileName = `${title || 'Note'}.md`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    const markdownContent = `# ${title}\n\n${content}`;
    
    await FileSystem.writeAsStringAsync(fileUri, markdownContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert('Success', `Note saved to ${fileUri}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error exporting as markdown:', error);
    Alert.alert('Error', 'Failed to export note');
    return false;
  }
};

/**
 * Export note as HTML file
 */
export const exportAsHTML = async (title, content) => {
  try {
    const fileName = `${title || 'Note'}.html`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    // Convert markdown-style formatting to HTML
    let htmlContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^- \[ \] (.*$)/gim, '<input type="checkbox"> $1<br>')
      .replace(/^- \[x\] (.*$)/gim, '<input type="checkbox" checked> $1<br>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n/g, '<br>');
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { font-size: 2em; margin-bottom: 0.5em; }
    h2 { font-size: 1.5em; margin-top: 1em; }
    h3 { font-size: 1.2em; margin-top: 1em; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div>${htmlContent}</div>
</body>
</html>`;
    
    await FileSystem.writeAsStringAsync(fileUri, html, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert('Success', `Note saved to ${fileUri}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error exporting as HTML:', error);
    Alert.alert('Error', 'Failed to export note');
    return false;
  }
};
