import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext.jsx';

export default function SplashScreen({ onFinish }) {
  const { isDark } = useTheme();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });

    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#FFFFFF' }}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 40,
        }}
      >
        <Animated.View
          style={[animatedStyle, { alignItems: 'center', width: '100%' }]}
        >
          <View
            style={{
              width: 96,
              height: 96,
              backgroundColor: '#3B82F6',
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 48 }}>📝</Text>
          </View>

          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              fontFamily: 'Inter_700Bold',
              fontSize: 36,
              color: isDark ? '#FFFFFF' : '#111827',
              textAlign: 'center',
              marginBottom: 8,
              width: '100%',
            }}
          >
            Notely
          </Text>

          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 16,
              color: isDark ? '#9CA3AF' : '#6B7280',
              textAlign: 'center',
              width: '100%',
            }}
          >
            Your thoughts, secured
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
