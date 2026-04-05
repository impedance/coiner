import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../theme/colors';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
    children, 
    style, 
    intensity = 40,
    tint = 'light' 
}) => {
    const isIOS = Platform.OS === 'ios';

    if (isIOS) {
        return (
            <BlurView 
                intensity={intensity} 
                tint={tint} 
                style={[styles.card, styles.glassEffect, style]}
            >
                {children}
            </BlurView>
        );
    }

    // Fallback for Android/Web which might not support BlurView perfectly
    return (
        <View style={[styles.card, styles.fallbackEffect, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    glassEffect: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    fallbackEffect: {
        backgroundColor: Colors.card,
        // Elevation for Android
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
});
