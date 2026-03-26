import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDataSelection } from '../../src/hooks/useData';
import { usePlanning } from '../../src/hooks/usePlanning';
import { useGoals } from '../../src/hooks/useGoals';
import { router } from 'expo-router';

export default function TodayScreen() {
    const { isReady: isDataReady, accounts, transactions } = useDataSelection();

    // Get current month key (YYYY-MM)
    const monthKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    const { unassignedMoney, loading: planningLoading } = usePlanning(monthKey);
    const { goals, loading: goalsLoading } = useGoals();

    const isReady = isDataReady && !planningLoading && !goalsLoading;

    if (!isReady) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.opening_balance_cents, 0) +
        transactions.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount_cents : (tx.type === 'expense' ? -tx.amount_cents : 0)), 0);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceAmount}>{(totalBalance / 100).toFixed(2)} €</Text>

                <View style={styles.unassignedRow}>
                    <Text style={styles.unassignedLabel}>Unassigned:</Text>
                    <Text style={styles.unassignedAmount}>{(unassignedMoney / 100).toFixed(2)} €</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
                    onPress={() => router.push('/transaction/new?type=expense')}
                >
                    <Text style={styles.actionButtonText}>Add Expense</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#34C759' }]}
                    onPress={() => router.push('/transaction/new?type=income')}
                >
                    <Text style={styles.actionButtonText}>Add Income</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                {transactions.length === 0 ? (
                    <Text style={styles.emptyText}>No transactions yet.</Text>
                ) : (
                    transactions.slice(0, 5).map(tx => (
                        <View key={tx.id} style={styles.txItem}>
                            <Text style={styles.txNote}>{tx.note || 'No note'}</Text>
                            <Text style={[styles.txAmount, { color: tx.type === 'expense' ? '#FF3B30' : '#34C759' }]}>
                                {tx.type === 'expense' ? '-' : '+'}{(tx.amount_cents / 100).toFixed(2)}
                            </Text>
                        </View>
                    ))
                )}
            </View>

            {accounts.length === 0 && (
                <TouchableOpacity
                    style={styles.setupButton}
                    onPress={() => router.push('/settings')}
                >
                    <Text style={styles.setupButtonText}>Setup your first account</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    content: {
        padding: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    balanceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 20,
    },
    balanceLabel: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 4,
    },
    balanceAmount: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 16,
    },
    unassignedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        paddingTop: 12,
    },
    unassignedLabel: {
        fontSize: 14,
        color: '#3A3A3C',
        marginRight: 8,
    },
    unassignedAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
    },
    txItem: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    txNote: {
        fontSize: 16,
    },
    txAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        color: '#8E8E93',
        fontStyle: 'italic',
    },
    setupButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    setupButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
