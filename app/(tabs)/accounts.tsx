import React from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useDataSelection } from '../../src/hooks/useData';
import { Colors, Typography, Layout } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AccountsScreen() {
    const { accounts, isReady } = useDataSelection();

    const formatCents = (cents: number) => 
        (cents / 100).toLocaleString('ru-RU', { minimumFractionDigits: 0 }) + ' ₽';

    if (!isReady) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Accounts</Text>
                <TouchableOpacity 
                    style={styles.settingsButton}
                    onPress={() => router.push('/settings')}
                >
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                {accounts.length === 0 ? (
                    <Text style={styles.emptyText}>No accounts yet. Add one in Settings.</Text>
                ) : (
                    accounts.map(acc => (
                        <GlassCard key={acc.id} style={styles.accountCard}>
                            <View style={styles.accountIcon}>
                                <Ionicons 
                                    name={acc.type === 'savings' ? 'wallet' : 'card'} 
                                    size={24} 
                                    color={Colors.primary} 
                                />
                            </View>
                            <View style={styles.accountInfo}>
                                <Text style={styles.accountName}>{acc.name}</Text>
                                <Text style={styles.accountType}>{acc.type}</Text>
                            </View>
                            <View style={styles.accountBalanceContainer}>
                                <Text style={styles.accountBalance}>{formatCents(acc.opening_balance_cents)}</Text>
                            </View>
                        </GlassCard>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Layout.PADDING,
        paddingTop: 60,
        paddingBottom: 20,
        width: '100%',
        maxWidth: Layout.MAX_WIDTH,
        alignSelf: 'center',
    },
    title: {
        ...Typography.h1,
    },
    settingsButton: {
        backgroundColor: Colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: Layout.PADDING,
        paddingTop: 0,
        width: '100%',
        maxWidth: Layout.MAX_WIDTH,
        alignSelf: 'center',
    },
    accountCard: {
        flexDirection: 'row',
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
    },
    accountIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        ...Typography.bodyBold,
        fontSize: 18,
    },
    accountType: {
        ...Typography.small,
        color: Colors.textSecondary,
        textTransform: 'capitalize',
        marginTop: 2,
    },
    accountBalanceContainer: {
        alignItems: 'flex-end',
    },
    accountBalance: {
        ...Typography.h3,
        color: Colors.text,
    },
    emptyText: {
        ...Typography.body,
        textAlign: 'center',
        color: Colors.textSecondary,
        marginTop: 40,
    },
});
