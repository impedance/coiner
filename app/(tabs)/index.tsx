import React, { useMemo, useCallback, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useDataSelection } from '../../src/hooks/useData';
import { usePlanning } from '../../src/hooks/usePlanning';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { AnimatedProgressBar } from '../../src/components/AnimatedProgressBar';
import { BucketSheet } from '../../src/components/BucketSheet';
import { Category } from '../../src/types';

export default function BucketsScreen() {
    const { isReady: isDataReady, accounts, transactions } = useDataSelection();

    const monthKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    const { unassignedMoney, plans, categories, categoryGroups, loading: planningLoading, assignMoney, refresh } = usePlanning(monthKey);

    const isReady = isDataReady && !planningLoading;

    // Bucket sheet state
    const [sheetBucket, setSheetBucket] = useState<Category | null>(null);

    const getSpentForCategory = useCallback(
        (categoryId: string) =>
            transactions
                .filter(tx => tx.category_id === categoryId && tx.happened_at.startsWith(monthKey))
                .reduce((sum, tx) => sum + tx.amount_cents, 0),
        [transactions, monthKey]
    );

    const categoriesByGroup = useMemo(() => {
        const grouped: Record<string, Category[]> = {};
        categories.forEach(cat => {
            const groupId = cat.group_id || 'unprocessed';
            if (!grouped[groupId]) grouped[groupId] = [];
            grouped[groupId].push(cat);
        });
        return grouped;
    }, [categories]);

    const totalBalance = useMemo(
        () =>
            accounts.reduce((sum, acc) => sum + acc.opening_balance_cents, 0) +
            transactions.reduce(
                (sum, tx) =>
                    sum + (tx.type === 'income' ? tx.amount_cents : tx.type === 'expense' ? -tx.amount_cents : 0),
                0
            ),
        [accounts, transactions]
    );

    const handleActionPress = useCallback((route: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push(route as any);
    }, []);

    const monthLabel = useMemo(() => {
        return new Date().toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    }, []);

    const formatCents = (cents: number) =>
        (cents / 100).toLocaleString('ru-RU', { minimumFractionDigits: 0 }) + ' ₽';

    const getProgressColor = (progress: number): string => {
        if (progress < 0.7) return Colors.income;
        if (progress <= 0.9) return Colors.reserve;
        return Colors.expense;
    };

    if (!isReady) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const selectedPlan = sheetBucket ? plans.find(p => p.category_id === sheetBucket.id) ?? null : null;

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ── */}
                <View style={styles.header}>
                    <Text style={styles.monthLabel}>{monthLabel}</Text>
                    <TouchableOpacity onPress={() => router.push('/settings' as any)}>
                        <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* ── Balance Card (YNAB Header) ── */}
                {unassignedMoney > 0 && (
                    <GlassCard style={styles.readyToAssignCard} tint="dark" intensity={30}>
                        <Text style={styles.readyToAssignLabel}>Ready to Assign</Text>
                        <Text style={styles.readyToAssignAmount}>{formatCents(unassignedMoney)}</Text>
                        <TouchableOpacity
                            style={styles.assignButton}
                            onPress={() => {/* Open auto-assign or similar */}}
                        >
                            <Text style={styles.assignButtonText}>Assign Money</Text>
                        </TouchableOpacity>
                    </GlassCard>
                )}

                <View style={styles.secondaryBalanceRow}>
                    <View>
                        <Text style={styles.secondaryBalanceLabel}>Total Balance</Text>
                        <Text style={styles.secondaryBalanceValue}>{formatCents(totalBalance)}</Text>
                    </View>
                    
                    {/* ── Quick Actions (Small Icons) ── */}
                    <View style={styles.miniActions}>
                        <TouchableOpacity
                            style={[styles.miniActionButton, { backgroundColor: Colors.expense }]}
                            onPress={() => handleActionPress('/transaction/new?type=expense')}
                        >
                            <Ionicons name="remove" size={18} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.miniActionButton, { backgroundColor: Colors.income }]}
                            onPress={() => handleActionPress('/transaction/new?type=income')}
                        >
                            <Ionicons name="add" size={18} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.miniActionButton, { backgroundColor: Colors.primary }]}
                            onPress={() => handleActionPress('/transaction/new?type=transfer')}
                        >
                            <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Bucket Groups ── */}
                {categoryGroups.map(group => {
                    const groupCats = categoriesByGroup[group.id] || [];
                    if (groupCats.length === 0) return null;

                    return (
                        <View key={group.id} style={styles.groupSection}>
                            {/* Group Header */}
                            <View style={styles.groupHeader}>
                                <View style={styles.groupHeaderLine} />
                                <Text style={styles.groupName}>{group.name}</Text>
                                <View style={styles.groupHeaderLine} />
                            </View>

                            {/* Bucket Rows (YNAB Style) */}
                            <View style={styles.bucketList}>
                                {groupCats.map(cat => {
                                    const plan = plans.find(p => p.category_id === cat.id);
                                    const spent = getSpentForCategory(cat.id);
                                    const assigned = plan?.assigned_cents ?? 0;
                                    const available = assigned - spent;
                                    const progress = assigned > 0 ? Math.min(1, spent / assigned) : 0;
                                    
                                    let availableColor = 'transparent';
                                    let availableText = Colors.text;
                                    if (available > 0) {
                                        availableColor = 'hsla(142, 76%, 36%, 0.2)';
                                        availableText = '#4ADE80';
                                    } else if (available < 0) {
                                        availableColor = 'hsla(0, 84%, 60%, 0.2)';
                                        availableText = '#F87171';
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={styles.bucketRow}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                setSheetBucket(cat);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.bucketMainInfo}>
                                                <Text style={styles.bucketNameShort} numberOfLines={1}>
                                                    {cat.name}
                                                </Text>
                                            </View>

                                            <View style={styles.bucketValues}>
                                                <Text style={styles.valueText}>{formatCents(assigned)}</Text>
                                                <Text style={styles.valueText}>{formatCents(spent)}</Text>
                                                <View style={[styles.availablePill, { backgroundColor: availableColor }]}>
                                                    <Text style={[styles.availableText, { color: availableText }]}>
                                                        {formatCents(available)}
                                                    </Text>
                                                </View>
                                            </View>
                                            
                                            {/* Thin progress indicator at the bottom */}
                                            <View style={styles.miniProgressContainer}>
                                                <View 
                                                    style={[
                                                        styles.miniProgressBar, 
                                                        { 
                                                            width: `${progress * 100}%`,
                                                            backgroundColor: available < 0 ? Colors.expense : Colors.primary
                                                        }
                                                    ]} 
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}

                {/* Bottom padding */}
                <View style={{ height: 32 }} />
            </ScrollView>

            {/* ── BucketSheet ── */}
            <BucketSheet
                visible={!!sheetBucket}
                bucket={sheetBucket}
                plan={selectedPlan}
                allBuckets={categories}
                allPlans={plans}
                unassignedMoney={unassignedMoney}
                onClose={() => setSheetBucket(null)}
                onAssign={assignMoney}
                refreshData={refresh}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    monthLabel: {
        ...Typography.h2,
        textTransform: 'capitalize',
    },

    // YNAB Header Styles
    readyToAssignCard: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'hsla(142, 76%, 36%, 0.3)',
        backgroundColor: 'hsla(142, 76%, 36%, 0.05)',
    },
    readyToAssignLabel: {
        ...Typography.small,
        color: '#4ADE80',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    readyToAssignAmount: {
        ...Typography.h1,
        fontSize: 42,
        color: '#4ADE80',
        marginBottom: 12,
    },
    assignButton: {
        backgroundColor: 'hsla(142, 76%, 36%, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'hsla(142, 76%, 36%, 0.4)',
    },
    assignButtonText: {
        ...Typography.bodyBold,
        color: '#4ADE80',
        fontSize: 13,
    },

    secondaryBalanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    secondaryBalanceLabel: {
        ...Typography.small,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    secondaryBalanceValue: {
        ...Typography.bodyBold,
        fontSize: 16,
    },

    // Mini Actions
    miniActions: {
        flexDirection: 'row',
        gap: 8,
    },
    miniActionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },

    // Bucket List (YNAB Style)
    bucketList: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    bucketRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    bucketMainInfo: {
        flex: 1,
    },
    bucketNameShort: {
        ...Typography.bodyMedium,
        fontSize: 15,
        color: Colors.text,
    },
    bucketValues: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    valueText: {
        ...Typography.small,
        fontSize: 13,
        color: Colors.textSecondary,
        width: 60,
        textAlign: 'right',
    },
    availablePill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 75,
        alignItems: 'center',
    },
    availableText: {
        ...Typography.bodyBold,
        fontSize: 13,
    },
    miniProgressContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'transparent',
    },
    miniProgressBar: {
        height: '100%',
        borderRadius: 1,
    },

    // Group
    groupSection: {
        marginBottom: 20,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    groupHeaderLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
        opacity: 0.5,
    },
    groupName: {
        ...Typography.label,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: Colors.textSecondary,
    },
});
