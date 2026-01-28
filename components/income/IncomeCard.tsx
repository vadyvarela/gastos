import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Income } from '@/lib/types/income';
import { useFormattedCurrency } from '@/hooks/useFormattedCurrency';
import { useFormattedDate } from '@/hooks/useFormattedDate';
import { useCategoryStore } from '@/stores/categoryStore';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface IncomeCardProps {
  income: Income;
  onPress?: () => void;
  onDelete?: () => void;
}

export const IncomeCard = React.memo<IncomeCardProps>(({ income, onPress, onDelete }) => {
  const formattedValue = useFormattedCurrency(income.value);
  const formattedDate = useFormattedDate(income.date);
  const category = useCategoryStore(state => state.getCategoryById(income.category_id));
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.cardWrapper}
    >
      <LinearGradient
        colors={isDark 
          ? ['#1A1A1C', '#161618'] 
          : ['#FFFFFF', '#FAFAFA']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.leftContent}>
          {category && (
            <LinearGradient
              colors={['#34C75920', '#34C75910']}
              style={styles.iconWrapper}
            >
              <IconSymbol name={category.icon} size={20} color="#34C759" />
            </LinearGradient>
          )}
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {income.description}
            </Text>
            <View style={styles.metaContainer}>
              <Text style={styles.categoryName}>{category?.name || 'Sem categoria'}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.amount}>{formattedValue}</Text>
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              style={styles.deleteBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol name="trash" size={14} color={isDark ? '#8E8E93' : '#8E8E93'} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

IncomeCard.displayName = 'IncomeCard';

const getStyles = (isDark: boolean) => StyleSheet.create({
  cardWrapper: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryName: {
    fontSize: 12,
    color: isDark ? '#8E8E93' : '#8E8E93',
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: isDark ? '#8E8E93' : '#8E8E93',
  },
  date: {
    fontSize: 12,
    color: isDark ? '#8E8E93' : '#8E8E93',
    fontWeight: '500',
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759',
    letterSpacing: -0.3,
  },
  deleteBtn: {
    padding: 4,
  },
});
