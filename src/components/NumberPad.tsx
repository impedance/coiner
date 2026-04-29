import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface NumberPadProps {
    value: string;
    onChange: (value: string) => void;
    onDone?: () => void;
}

export const NumberPad: React.FC<NumberPadProps> = ({ value, onChange, onDone }) => {
    const handlePress = (key: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (key === 'backspace') {
            onChange(value.slice(0, -1));
        } else if (key === '.') {
            if (!value.includes('.')) {
                onChange(value + '.');
            }
        } else {
            // Prevent multiple leading zeros
            if (value === '0' && key === '0') return;
            // If value is 0 and we press a number, replace it
            if (value === '0' && key !== '0') {
                onChange(key);
            } else {
                onChange(value + key);
            }
        }
    };

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

    return (
        <View style={styles.container}>
            {keys.map((key, index) => {
                const isSpecial = key === 'backspace' || key === '.';
                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.key,
                            isSpecial && styles.specialKey
                        ]}
                        onPress={() => handlePress(key)}
                        activeOpacity={0.6}
                    >
                        {key === 'backspace' ? (
                            <Ionicons name="backspace-outline" size={26} color={Colors.text} />
                        ) : (
                            <Text style={styles.keyText}>{key}</Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    key: {
        width: '31%',
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'hsla(222, 15%, 20%, 1)',
        borderRadius: 14,
        marginBottom: 8,
    },
    specialKey: {
        backgroundColor: 'hsla(222, 15%, 16%, 1)',
    },
    keyText: {
        ...Typography.h3,
        color: Colors.text,
        fontSize: 24,
    },
});
