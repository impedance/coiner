import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDataSelection } from '../../src/hooks/useData';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Layout } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { router } from 'expo-router';

export default function TransactionsScreen() {
    const { transactions, categories, isReady } = useDataSelection();

    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => b.happened_at.localeCompare(a.happened_at));
    }, [transactions]);

    const formatCents = (cents: number) => 
        (cents / 100).toLocaleString('ru-RU', { minimumFractionDigits: 0 }) + ' ₽';

    const getCategoryName = (id: string | null | undefined) => {
        if (!id) return 'Uncategorized';
        return categories.find(c => c.id === id)?.name || 'Unknown';
    };

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
                <Text style={styles.title}>Transactions</Text>
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => router.push('/transaction/new')}
                >
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                {sortedTransactions.length === 0 ? (
                    <Text style={styles.emptyText}>No transactions yet.</Text>
                ) : (
                    sortedTransactions.map(tx => (
                        <GlassCard key={tx.id} style={styles.txCard}>
                            <View style={styles.txMain}>
                                <Text style={styles.txCategory}>{getCategoryName(tx.category_id)}</Text>
                                <Text style={styles.txNote}>{tx.note || 'No note'}</Text>
                                <Text style={styles.txDate}>{new Date(tx.happened_at).toLocaleDateString('ru-RU')}</Text>
                            </View>
                            <View style={styles.txAmountContainer}>
                                <Text style={[
                                    styles.txAmount,
                                    { color: tx.type === 'income' ? Colors.income : Colors.expense }
                                ]}>
                                    {tx.type === 'income' ? '+' : '-'}{formatCents(tx.amount_cents)}
                                </Text>
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
    addButton: {
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
    txCard: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    txMain: {
        flex: 1,
    },
    txCategory: {
        ...Typography.bodyBold,
        fontSize: 16,
    },
    txNote: {
        ...Typography.body,
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    txDate: {
        ...Typography.small,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    txAmountContainer: {
        alignItems: 'flex-end',
    },
    txAmount: {
        ...Typography.bodyBold,
        fontSize: 16,
    },
    emptyText: {
        ...Typography.body,
        textAlign: 'center',
        color: Colors.textSecondary,
        marginTop: 40,
    },
});
