import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingSpinner({ size = 'large', color }: LoadingSpinnerProps) {
  const colorScheme = useColorScheme();
  const defaultColor = colorScheme === 'dark' ? '#ffffff' : '#000000';

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color || defaultColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
