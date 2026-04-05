import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming 
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';

interface AnimatedProgressBarProps {
    progress: number; // 0 to 1
    color?: string;
    height?: number;
    style?: ViewStyle;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({ 
    progress, 
    color = Colors.primary, 
    height = 6,
    style 
}) => {
    const animatedWidth = useSharedValue(0);

    useEffect(() => {
        animatedWidth.value = withSpring(Math.max(0, Math.min(1, progress)), {
            damping: 20,
            stiffness: 90,
        });
    }, [progress]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${animatedWidth.value * 100}%`,
        };
    });

    return (
        <View style={[styles.container, { height }, style]}>
            <Animated.View 
                style={[
                    styles.fill, 
                    { backgroundColor: color }, 
                    animatedStyle
                ]} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 10,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 10,
    },
});
