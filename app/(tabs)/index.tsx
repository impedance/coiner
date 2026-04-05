import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDataSelection } from '../../src/hooks/useData';
import { usePlanning } from '../../src/hooks/usePlanning';
import { useReports } from '../../src/hooks/useReports';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TodayScreen() {
    const { isReady: isDataReady, accounts, transactions } = useDataSelection();

    // Get current month key (YYYY-MM)
    const monthKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    const { unassignedMoney, loading: planningLoading } = usePlanning(monthKey);
    const { 
        reserveTrend, joyTrend, goalsSummary, cycleSummary, nextAction,
        loading: reportsLoading 
    } = useReports();

    const isReady = isDataReady && !planningLoading && !reportsLoading;

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
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Today</Text>
                <TouchableOpacity onPress={() => router.push('/settings')}>
                    <Ionicons name="settings-outline" size={24} color="#8E8E93" />
                </TouchableOpacity>
            </View>

            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceAmount}>{(totalBalance / 100).toFixed(2)} €</Text>

                <View style={styles.unassignedRow}>
                    <Text style={styles.unassignedLabel}>To be assigned:</Text>
                    <Text style={[styles.unassignedAmount, { color: unassignedMoney > 0 ? '#34C759' : '#8E8E93' }]}>
                        {(unassignedMoney / 100).toFixed(2)} €
                    </Text>
                </View>
            </View>

            {/* Next Action Hint */}
            <TouchableOpacity 
                style={styles.nextActionCard}
                onPress={() => router.push(nextAction.route as any)}
            >
                <View style={styles.nextActionIcon}>
                    <Ionicons name={nextAction.icon as any} size={24} color="#007AFF" />
                </View>
                <View style={styles.nextActionInfo}>
                    <Text style={styles.nextActionTitle}>{nextAction.title}</Text>
                    <Text style={styles.nextActionDesc}>{nextAction.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
                    onPress={() => router.push('/transaction/new?type=expense')}
                >
                    <Ionicons name="remove-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Expense</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#34C759' }]}
                    onPress={() => router.push('/transaction/new?type=income')}
                >
                    <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Income</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
                    onPress={() => router.push('/transaction/new?type=transfer')}
                >
                    <Ionicons name="swap-horizontal" size={24} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Transfer</Text>
                </TouchableOpacity>
            </View>

            {/* Progress Overview Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Progress Overview</Text>
                
                <View style={styles.statsGrid}>
                    {/* Reserve */}
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Ionicons name="shield-checkmark" size={16} color="#FF9500" />
                            <Text style={styles.statLabel}>Reserve</Text>
                        </View>
                        <Text style={styles.statValue}>{(reserveTrend.current / 100).toFixed(0)}€</Text>
                        <View style={styles.miniProgressBar}>
                            <View 
                                style={[
                                    styles.miniProgressFill, 
                                    { 
                                        width: `${Math.min(1, reserveTrend.target > 0 ? reserveTrend.current / reserveTrend.target : 0) * 100}%`,
                                        backgroundColor: '#FF9500' 
                                    }
                                ]} 
                            />
                        </View>
                    </View>

                    {/* Joy Fund */}
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Ionicons name="heart" size={16} color="#FF2D55" />
                            <Text style={styles.statLabel}>Joy Fund</Text>
                        </View>
                        <Text style={styles.statValue}>{(joyTrend.current / 100).toFixed(0)}€</Text>
                        <View style={styles.miniProgressBar}>
                            <View 
                                style={[
                                    styles.miniProgressFill, 
                                    { 
                                        width: `${Math.min(1, joyTrend.target > 0 ? joyTrend.current / joyTrend.target : 0) * 100}%`,
                                        backgroundColor: '#FF2D55' 
                                    }
                                ]} 
                            />
                        </View>
                    </View>

                    {/* Goals */}
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Ionicons name="trophy" size={16} color="#FFCC00" />
                            <Text style={styles.statLabel}>Goals</Text>
                        </View>
                        <Text style={styles.statValue}>{goalsSummary.count} Active</Text>
                        <View style={styles.miniProgressBar}>
                            <View 
                                style={[
                                    styles.miniProgressFill, 
                                    { 
                                        width: `${goalsSummary.percentage * 100}%`,
                                        backgroundColor: '#FFCC00' 
                                    }
                                ]} 
                            />
                        </View>
                    </View>

                    {/* Cycle */}
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Ionicons name="repeat" size={16} color="#5856D6" />
                            <Text style={styles.statLabel}>Cycle</Text>
                        </View>
                        <Text style={styles.statValue}>
                            {cycleSummary ? `${cycleSummary.daysLeft}d left` : 'No Cycle'}
                        </Text>
                        <View style={styles.miniProgressBar}>
                            <View 
                                style={[
                                    styles.miniProgressFill, 
                                    { 
                                        width: `${(cycleSummary?.progress || 0) * 100}%`,
                                        backgroundColor: '#5856D6' 
                                    }
                                ]} 
                            />
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <TouchableOpacity onPress={() => router.push('/report')}>
                        <Text style={styles.seeAllText}>See Reports</Text>
                    </TouchableOpacity>
                </View>
                {transactions.length === 0 ? (
                    <Text style={styles.emptyText}>No transactions yet.</Text>
                ) : (
                    transactions.slice(0, 5).map(tx => (
                        <View key={tx.id} style={styles.txItem}>
                            <View style={styles.txInfo}>
                                <Text style={styles.txNote}>{tx.note || 'Transaction'}</Text>
                                <Text style={styles.txDate}>{new Date(tx.happened_at).toLocaleDateString()}</Text>
                            </View>
                            <Text style={[styles.txAmount, { color: tx.type === 'expense' ? '#FF3B30' : '#34C759' }]}>
                                {tx.type === 'expense' ? '-' : '+'}{(tx.amount_cents / 100).toFixed(2)} €
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
                    <Ionicons name="warning-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.setupButtonText}>Setup your first account</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    content: { padding: 20, paddingTop: 60 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 34, fontWeight: 'bold', color: '#000000' },
    balanceCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3, marginBottom: 24 },
    balanceLabel: { fontSize: 16, color: '#8E8E93', marginBottom: 4, fontWeight: '500' },
    balanceAmount: { fontSize: 40, fontWeight: '800', color: '#000000', marginBottom: 16, letterSpacing: -1 },
    unassignedRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 16 },
    unassignedLabel: { fontSize: 14, color: '#3A3A3C', marginRight: 8 },
    unassignedAmount: { fontSize: 14, fontWeight: '700' },
    nextActionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E5E5EA', gap: 12 },
    nextActionIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F2F9FF', justifyContent: 'center', alignItems: 'center' },
    nextActionInfo: { flex: 1 },
    nextActionTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
    nextActionDesc: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
    actions: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    actionButton: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 2 },
    actionButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16, color: '#1C1C1E' },
    seeAllText: { color: '#007AFF', fontWeight: '600' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, width: '48%', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    statHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    statLabel: { fontSize: 12, color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase' },
    statValue: { fontSize: 18, fontWeight: '800', color: '#1C1C1E', marginBottom: 10 },
    miniProgressBar: { height: 4, backgroundColor: '#F2F2F7', borderRadius: 2, overflow: 'hidden' },
    miniProgressFill: { height: '100%', borderRadius: 2 },
    txItem: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    txInfo: { flex: 1 },
    txNote: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginBottom: 2 },
    txDate: { fontSize: 12, color: '#8E8E93' },
    txAmount: { fontSize: 16, fontWeight: '700' },
    emptyText: { color: '#C7C7CC', fontStyle: 'italic', textAlign: 'center', padding: 20 },
    setupButton: { backgroundColor: '#007AFF', padding: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    setupButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
