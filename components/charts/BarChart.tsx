import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, G, Text as SvgText } from 'react-native-svg';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/currency';

interface BarChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface BarChartProps {
  data: BarChartData[];
  maxValue?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const BAR_HEIGHT = 32;
const BAR_SPACING = 12;
const LABEL_WIDTH = 90;
const MAX_BAR_WIDTH = CHART_WIDTH - LABEL_WIDTH - 24;

export function BarChart({ data, maxValue }: BarChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Sem dados para exibir</Text>
      </View>
    );
  }

  const max = maxValue || Math.max(...data.map(d => d.value));
  const chartHeight = data.length * (BAR_HEIGHT + BAR_SPACING);

  return (
    <View style={styles.container}>
      <Svg width={CHART_WIDTH} height={chartHeight} viewBox={`0 0 ${CHART_WIDTH} ${chartHeight}`}>
        <G>
          {data.map((item, index) => {
            const barWidth = Math.max((item.value / max) * MAX_BAR_WIDTH, 30);
            const y = index * (BAR_HEIGHT + BAR_SPACING);
            const formattedValue = formatCurrency(item.value);
            const label = item.label.length > 12 ? item.label.substring(0, 10) + '...' : item.label;

            return (
              <G key={index}>
                <Rect
                  x={LABEL_WIDTH}
                  y={y}
                  width={barWidth}
                  height={BAR_HEIGHT}
                  fill={item.color}
                  rx={8}
                  opacity={0.9}
                />
                <SvgText
                  x={LABEL_WIDTH - 8}
                  y={y + BAR_HEIGHT / 2 + 5}
                  fontSize={11}
                  fill={isDark ? '#94A3B8' : '#64748B'}
                  textAnchor="end"
                  fontWeight="600"
                >
                  {label}
                </SvgText>
                <SvgText
                  x={LABEL_WIDTH + barWidth + 8}
                  y={y + BAR_HEIGHT / 2 + 4}
                  fontSize={11}
                  fill={isDark ? '#FFFFFF' : '#0F172A'}
                  fontWeight="700"
                >
                  {formattedValue}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  emptyText: {
    color: isDark ? '#94A3B8' : '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
});
