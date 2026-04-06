import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withDelay,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { GlassCard } from './GlassCard';
import { Ionicons } from '@expo/vector-icons';

interface CelebrationCardProps {
    title: string;
    description: string;
    style?: ViewStyle;
}

export const CelebrationCard: React.FC<CelebrationCardProps> = ({ 
    title, 
    description, 
    style 
}) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 90 });
        opacity.value = withDelay(200, withSpring(1));
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle, style]}>
            <GlassCard style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="sparkles" size={24} color="#FFD700" />
                    </View>
                    <Text style={styles.title}>{title}</Text>
                </View>
                <Text style={styles.description}>{description}</Text>
            </GlassCard>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 12,
    },
    card: {
        padding: 24,
        borderWidth: 2,
        borderColor: 'hsla(45, 100%, 50%, 0.3)', // Golden tint
        backgroundColor: 'hsla(45, 100%, 95%, 0.5)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        ...Typography.h3,
        color: '#B8860B', // Dark Golden Rod
    },
    description: {
        ...Typography.body,
        fontSize: 15,
        lineHeight: 22,
        color: '#555',
    },
});
