/**
 * Typography Scale for Coiner
 * 
 * Inter for UI (clean, high-readability)
 * Outfit for Headers (geometric, "WOW-effect")
 */

import { Colors } from './colors';

export const Fonts = {
    // UI
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    bold: 'Inter_700Bold',
    
    // Headers
    header: 'Outfit_800ExtraBold',
    headerMedium: 'Outfit_600SemiBold',
};

export const Typography = {
    h1: {
        fontFamily: Fonts.header,
        fontSize: 34,
        letterSpacing: -1,
        color: Colors.text,
    },
    h2: {
        fontFamily: Fonts.header,
        fontSize: 24,
        letterSpacing: -0.5,
        color: Colors.text,
    },
    h3: {
        fontFamily: Fonts.headerMedium,
        fontSize: 20,
        color: Colors.text,
    },
    body: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: Colors.text,
    },
    bodyMedium: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: Colors.text,
    },
    bodyBold: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: Colors.text,
    },
    label: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: Colors.textSecondary,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
    },
    small: {
        fontFamily: Fonts.regular,
        fontSize: 12,
        color: Colors.textSecondary,
    },
};

