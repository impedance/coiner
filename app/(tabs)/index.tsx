import React, { useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDataSelection } from '../../src/hooks/useData';
import { usePlanning } from '../../src/hooks/usePlanning';
import { useReports } from '../../src/hooks/useReports';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Theme, Colors, Typography } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { AnimatedProgressBar } from '../../src/components/AnimatedProgressBar';

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

    const handleActionPress = useCallback((route: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push(route as any);
    }, []);

    const handleSoftPress = useCallback((route: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(route as any);
    }, []);

    if (!isReady) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.opening_balance_cents, 0) +
        transactions.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount_cents : (tx.type === 'expense' ? -tx.amount_cents : 0)), 0);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Today</Text>
                <TouchableOpacity onPress={() => handleSoftPress('/settings')}>
                    <Ionicons name="settings-outline" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <GlassCard style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceAmount}>{(totalBalance / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</Text>

                <View style={styles.unassignedRow}>
                    <Text style={styles.unassignedLabel}>To be assigned:</Text>
                    <Text style={[styles.unassignedAmount, { color: unassignedMoney > 0 ? Colors.income : Colors.textSecondary }]}>
                        {(unassignedMoney / 100).toFixed(2)} €
                    </Text>
                </View>
            </GlassCard>

            {/* Next Action Hint */}
            <TouchableOpacity 
                style={styles.nextActionCard}
                onPress={() => handleSoftPress(nextAction.route)}
            >
                <View style={styles.nextActionIcon}>
                    <Ionicons name={nextAction.icon as any} size={24} color={Colors.primary} />
                </View>
                <View style={styles.nextActionInfo}>
                    <Text style={styles.nextActionTitle}>{nextAction.title}</Text>
                    <Text style={styles.nextActionDesc}>{nextAction.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.border} />
            </TouchableOpacity>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.expense }]}
                    onPress={() => handleActionPress('/transaction/new?type=expense')}
                >
                    <Ionicons name="remove-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Expense</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.income }]}
                    onPress={() => handleActionPress('/transaction/new?type=income')}
                >
                    <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Income</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                    onPress={() => handleActionPress('/transaction/new?type=transfer')}
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
                    <GlassCard style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Ionicons name="shield-checkmark" size={16} color={Colors.reserve} />
                            <Text style={styles.statLabel}>Reserve</Text>
                        </View>
                        <Text style={styles.statValue}>{(reserveTrend.current / 100).toFixed(0)}€</Text>
                        <AnimatedProgressBar 
                            progress={reserveTrend.target > 0 ? reserveTrend.current / reserveTrend.target : 0}
                            color={Colors.reserve}
                        />
                    </GlassCard>

                    {/* Joy Fund */}
                    <GlassCard style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Ionicons name="heart" size={16} color={Colors.joy} />
                            <Text style={styles.statLabel}>Joy Fund</Text>
                        </View>
                        <Text style={styles.statValue}>{(joyTrend.current / 100).toFixed(0)}€</Text>
                        <AnimatedProgressBar 
                            progress={joyTrend.target > 0 ? joyTrend.current / joyTrend.target : 0}
                            color={Colors.joy}
                        />
                    </GlassCard>

                    {/* Goals */}
                    <GlassCard style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Ionicons name="trophy" size={16} color="#FFCC00" />
                            <Text style={styles.statLabel}>Goals</Text>
                        </View>
                        <Text style={styles.statValue}>{goalsSummary.count} Active</Text>
                        <AnimatedProgressBar 
                            progress={goalsSummary.percentage}
                            color="#FFCC00"
                        />
                    </GlassCard>

                    {/* Cycle */}
                    <GlassCard style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Ionicons name="repeat" size={16} color={Colors.secondary} />
                            <Text style={styles.statLabel}>Cycle</Text>
                        </View>
                        <Text style={styles.statValue}>
                            {cycleSummary ? `${cycleSummary.daysLeft}d left` : 'No Cycle'}
                        </Text>
                        <AnimatedProgressBar 
                            progress={cycleSummary?.progress || 0}
                            color={Colors.secondary}
                        />
                    </GlassCard>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <TouchableOpacity onPress={() => handleSoftPress('/report')}>
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
                            <Text style={[styles.txAmount, { color: tx.type === 'expense' ? Colors.expense : Colors.income }]}>
                                {tx.type === 'expense' ? '-' : '+'}{(tx.amount_cents / 100).toFixed(2)} €
                            </Text>
                        </View>
                    ))
                )}
            </View>

            {accounts.length === 0 && (
                <TouchableOpacity
                    style={styles.setupButton}
                    onPress={() => handleSoftPress('/settings')}
                >
                    <Ionicons name="warning-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.setupButtonText}>Setup your first account</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: 20, paddingTop: 60 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { ...Typography.h1 },
    balanceCard: { marginBottom: 24, padding: 24 },
    balanceLabel: { ...Typography.label, marginBottom: 8 },
    balanceAmount: { ...Typography.h1, fontSize: 40, marginBottom: 16 },
    unassignedRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 16 },
    unassignedLabel: { ...Typography.body, fontSize: 14, marginRight: 8 },
    unassignedAmount: { ...Typography.bodyBold, fontSize: 14 },
    nextActionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 24, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: Colors.glassBorder, gap: 12 },
    nextActionIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'hsla(210, 100%, 95%, 1)', justifyContent: 'center', alignItems: 'center' },
    nextActionInfo: { flex: 1 },
    nextActionTitle: { ...Typography.bodyBold },
    nextActionDesc: { ...Typography.small, marginTop: 2 },
    actions: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    actionButton: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    actionButtonText: { ...Typography.bodyBold, color: '#FFFFFF', fontSize: 14 },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { ...Typography.h2, marginBottom: 0 },
    seeAllText: { ...Typography.bodyMedium, color: Colors.primary, fontSize: 14 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { width: '48%', padding: 16 },
    statHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    statLabel: { ...Typography.label, fontSize: 10 },
    statValue: { ...Typography.h3, marginBottom: 12 },
    txItem: { backgroundColor: Colors.card, padding: 16, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: Colors.glassBorder },
    txInfo: { flex: 1 },
    txNote: { ...Typography.bodyMedium },
    txDate: { ...Typography.small },
    txAmount: { ...Typography.bodyBold },
    emptyText: { ...Typography.body, color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center', padding: 20 },
    setupButton: { backgroundColor: Colors.primary, padding: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    setupButtonText: { ...Typography.bodyBold, color: '#FFFFFF' },
});
