import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface DataPoint {
    label: string;
    value: number;
}

interface SimpleBarChartProps {
    data: DataPoint[];
    height?: number;
    color?: string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
    data, 
    height = 100, 
    color = Colors.primary 
}) => {
    const maxValue = Math.max(...data.map(d => Math.abs(d.value)), 100);
    
    return (
        <View style={[styles.container, { height }]}>
            <View style={styles.chartArea}>
                {data.map((point, index) => {
                    const barHeight = (Math.abs(point.value) / maxValue) * height * 0.8;
                    const isPositive = point.value >= 0;
                    
                    return (
                        <View key={index} style={styles.barContainer}>
                            <View 
                                style={[
                                    styles.bar, 
                                    { 
                                        height: barHeight, 
                                        backgroundColor: isPositive ? color : Colors.expense,
                                        opacity: 0.8 + (index / data.length) * 0.2
                                    }
                                ]} 
                            />
                            <Text style={styles.label} numberOfLines={1}>
                                {point.label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingTop: 20,
    },
    chartArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    bar: {
        width: '100%',
        minWidth: 12,
        borderRadius: 6,
    },
    label: {
        ...Typography.small,
        fontSize: 8,
        marginTop: 6,
        textAlign: 'center',
    },
});
