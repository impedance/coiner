/**
 * Typography Scale for Coiner
 * 
 * Inter for UI (clean, high-readability)
 * Outfit for Headers (geometric, "WOW-effect")
 */

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
        color: 'hsla(0, 0%, 10%, 1)',
    },
    h2: {
        fontFamily: Fonts.header,
        fontSize: 24,
        letterSpacing: -0.5,
        color: 'hsla(0, 0%, 10%, 1)',
    },
    h3: {
        fontFamily: Fonts.headerMedium,
        fontSize: 20,
        color: 'hsla(0, 0%, 10%, 1)',
    },
    body: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: 'hsla(0, 0%, 10%, 1)',
    },
    bodyMedium: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: 'hsla(0, 0%, 10%, 1)',
    },
    bodyBold: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: 'hsla(0, 0%, 10%, 1)',
    },
    label: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: 'hsla(0, 0%, 50%, 1)',
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
    },
    small: {
        fontFamily: Fonts.regular,
        fontSize: 12,
        color: 'hsla(0, 0%, 50%, 1)',
    },
};
