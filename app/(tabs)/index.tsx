import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Modal,
    TextInput,
} from 'react-native';
import { useDataSelection } from '../../src/hooks/useData';
import { usePlanning } from '../../src/hooks/usePlanning';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Layout } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { AnimatedProgressBar } from '../../src/components/AnimatedProgressBar';
import { BucketSheet } from '../../src/components/BucketSheet';
import { Category, Transaction, MonthlyBucketPlan } from '../../src/types';
import { getBucketState, getBudgetSummary, getTotalAccountBalance } from '../../src/domain/budget/calculators';
import { monthlyBucketPlanRepository } from '../../src/db/repositories/MonthlyBucketPlanRepository';
import { categoryRepository } from '../../src/db/repositories/CategoryRepository';
import { Alert } from 'react-native';

export default function BucketsScreen() {
    const { isReady: isDataReady, accounts, transactions } = useDataSelection();
    const { categoryId: autoOpenCategoryId } = useLocalSearchParams<{ categoryId: string }>();

    const monthKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    const { unassignedMoney, plans, allPlans, categories, categoryGroups, loading: planningLoading, assignMoney, refresh } = usePlanning(monthKey);

    const prevMonthKey = useMemo(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    const showCarryForward = useMemo(() => {
        if (plans.length > 0) return false;
        return allPlans.some(p => p.month_key === prevMonthKey);
    }, [plans, allPlans, prevMonthKey]);

    const handleCarryForward = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await monthlyBucketPlanRepository.carryForward(prevMonthKey, monthKey);
        await refresh();
    };

    const isReady = isDataReady && !planningLoading;

    // Bucket sheet state
    const [sheetBucket, setSheetBucket] = useState<Category | null>(null);
    const [isAddingBucket, setIsAddingBucket] = useState(false);
    const [newBucketName, setNewBucketName] = useState('');

    // Auto-open sheet if categoryId is provided (e.g. from overspending flow)
    useEffect(() => {
        if (autoOpenCategoryId && categories.length > 0) {
            const cat = categories.find(c => c.id === autoOpenCategoryId);
            if (cat) {
                setSheetBucket(cat);
                // Clear the param after opening? Router.setParams might work but replace is safer
            }
        }
    }, [autoOpenCategoryId, categories]);

    const getSpentForCategory = useCallback(
        (categoryId: string) =>
            transactions
                .filter(tx => tx.category_id === categoryId && tx.type === 'expense' && tx.happened_at.startsWith(monthKey))
                .reduce((sum, tx) => sum + tx.amount_cents, 0),
        [transactions, monthKey]
    );

    const handleDeleteBucket = (cat: Category) => {
        Alert.alert(
            'Delete Bucket',
            `Are you sure you want to delete "${cat.name}"? Historical data will be preserved but the bucket will no longer appear in your budget.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive', 
                    onPress: async () => {
                        await categoryRepository.delete(cat.id);
                        await refresh();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    } 
                }
            ]
        );
    };

    const handleAddBucket = async (groupId: string) => {
        // We'll use the modal now
        setIsAddingBucket(true);
    };

    const confirmAddBucket = async () => {
        if (!newBucketName) {
            setIsAddingBucket(false);
            return;
        }
        await categoryRepository.create({ 
            name: newBucketName, 
            group_id: categoryGroups[0]?.id || 'default', 
            kind: 'expense' 
        });
        setNewBucketName('');
        setIsAddingBucket(false);
        await refresh();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

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
        () => getTotalAccountBalance(accounts, transactions),
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

                {/* ── Carry Forward Prompt ── */}
                {showCarryForward && (
                    <TouchableOpacity onPress={handleCarryForward} activeOpacity={0.8}>
                        <GlassCard style={styles.carryForwardCard}>
                            <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
                            <View style={styles.carryForwardText}>
                                <Text style={styles.carryForwardTitle}>Starting a new month?</Text>
                                <Text style={styles.carryForwardSub}>Carry forward your plans from {new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('ru-RU', { month: 'long' })}.</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                        </GlassCard>
                    </TouchableOpacity>
                )}


                {/* ── Balance Card (YNAB Header) ── */}
                <GlassCard 
                    style={[
                        styles.readyToAssignCard, 
                        unassignedMoney < 0 && styles.readyToAssignCardNegative
                    ]} 
                    tint="dark" 
                    intensity={30}
                >
                    <Text style={[
                        styles.readyToAssignLabel,
                        unassignedMoney < 0 && { color: Colors.expense }
                    ]}>
                        {unassignedMoney < 0 ? 'Overassigned' : 'Ready to Assign'}
                    </Text>
                    <Text style={[
                        styles.readyToAssignAmount,
                        unassignedMoney < 0 && { color: Colors.expense }
                    ]}>
                        {formatCents(unassignedMoney)}
                    </Text>
                    <View style={styles.readyToAssignActions}>
                        <TouchableOpacity
                            style={[
                                styles.assignButton,
                                unassignedMoney < 0 && { borderColor: Colors.expense }
                            ]}
                            onPress={() => handleActionPress('/budget/assign')}
                        >
                            <Text style={[
                                styles.assignButtonText,
                                unassignedMoney < 0 && { color: Colors.expense }
                            ]}>Assign Money</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.addBucketButton}
                            onPress={() => handleAddBucket(categoryGroups[0]?.id || 'default')}
                        >
                            <Ionicons name="add-circle-outline" size={18} color="#4ADE80" />
                            <Text style={styles.addBucketButtonText}>Add Bucket</Text>
                        </TouchableOpacity>
                    </View>
                </GlassCard>

                <View style={styles.secondaryBalanceRow}>
                    <View>
                        <Text style={styles.secondaryBalanceLabel}>Total Balance</Text>
                        <Text style={styles.secondaryBalanceValue}>{formatCents(totalBalance)}</Text>
                    </View>
                    
                    {/* ── Quick Actions (Small Icons) ── */}
                    <View style={styles.miniActions}>
                        <TouchableOpacity
                            style={[styles.miniActionButton, { backgroundColor: Colors.income }]}
                            onPress={() => handleActionPress('/transaction/new?type=income')}
                        >
                            <Ionicons name="add" size={18} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.miniActionButton, { backgroundColor: Colors.expense }]}
                            onPress={() => handleActionPress('/transaction/new?type=expense')}
                        >
                            <Ionicons name="remove" size={18} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.miniActionButton, { backgroundColor: Colors.primary }]}
                            onPress={() => handleActionPress('/budget/assign')}
                        >
                            <Ionicons name="pie-chart" size={18} color="#FFFFFF" />
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
                                    const bucketState = getBucketState(cat.id, allPlans, transactions, monthKey);
                                    const { assignedCents: assigned, spentCents: spent, availableCents: available } = bucketState;
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
                                                
                                                {/* Action Icons */}
                                                <View style={styles.bucketActions}>
                                                    <TouchableOpacity 
                                                        style={styles.bucketActionIcon}
                                                        onPress={() => {
                                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                            setSheetBucket(cat);
                                                        }}
                                                    >
                                                        <Ionicons name="remove-circle-outline" size={18} color={Colors.expense} />
                                                    </TouchableOpacity>
                                                    
                                                    <TouchableOpacity 
                                                        style={styles.bucketActionIcon}
                                                        onPress={() => {
                                                            setSheetBucket(cat);
                                                            // Maybe open directly to an "edit" mode if implemented
                                                        }}
                                                    >
                                                        <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
                                                    </TouchableOpacity>

                                                    <TouchableOpacity 
                                                        style={styles.bucketActionIcon}
                                                        onPress={() => handleDeleteBucket(cat)}
                                                    >
                                                        <Ionicons name="trash-outline" size={18} color={Colors.textSecondary} />
                                                    </TouchableOpacity>
                                                </View>
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

            {/* ── Add Bucket Modal ── */}
            <Modal
                visible={isAddingBucket}
                transparent
                animationType="fade"
                onRequestClose={() => setIsAddingBucket(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.backdrop} onPress={() => setIsAddingBucket(false)} />
                    <GlassCard style={styles.modalCard}>
                        <Text style={styles.modalTitle}>New Bucket</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Bucket name..."
                            placeholderTextColor={Colors.textSecondary}
                            value={newBucketName}
                            onChangeText={setNewBucketName}
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setIsAddingBucket(false)}>
                                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={confirmAddBucket}>
                                <Text style={styles.modalButtonTextPrimary}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                </View>
            </Modal>

            {/* ── BucketSheet ── */}
            <BucketSheet
                visible={!!sheetBucket}
                bucket={sheetBucket}
                plan={selectedPlan}
                allBuckets={categories}
                allPlans={allPlans}
                unassignedMoney={unassignedMoney}
                transactions={transactions}
                monthKey={monthKey}
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
        padding: Layout.PADDING,
        paddingTop: 60,
        paddingBottom: 40,
        width: '100%',
        maxWidth: Layout.MAX_WIDTH,
        alignSelf: 'center',
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

    // Carry Forward
    carryForwardCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    carryForwardText: {
        flex: 1,
        marginLeft: 12,
    },
    carryForwardTitle: {
        ...Typography.bodyBold,
        color: Colors.primary,
    },
    carryForwardSub: {
        ...Typography.small,
        color: Colors.textSecondary,
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
    readyToAssignCardNegative: {
        borderColor: 'hsla(0, 84%, 60%, 0.3)',
        backgroundColor: 'hsla(0, 84%, 60%, 0.05)',
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
    readyToAssignActions: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    assignButton: {
        backgroundColor: 'hsla(142, 76%, 36%, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'hsla(142, 76%, 36%, 0.4)',
    },
    addBucketButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    addBucketButtonText: {
        ...Typography.bodyBold,
        color: '#4ADE80',
        fontSize: 13,
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        ...Typography.label,
        fontSize: 12,
        color: Colors.textSecondary,
    },
    addBucketHeaderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addBucketHeaderText: {
        ...Typography.small,
        color: Colors.primary,
        fontWeight: '600',
    },
    bucketActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    bucketActionIcon: {
        padding: 4,
        margin: -4,
        opacity: 0.7,
    },

    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '85%',
        maxWidth: 340,
        padding: 24,
        borderRadius: 24,
        backgroundColor: Colors.card,
    },
    modalTitle: {
        ...Typography.h3,
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 14,
        color: Colors.text,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    modalButtonPrimary: {
        backgroundColor: Colors.primary,
    },
    modalButtonTextPrimary: {
        ...Typography.bodyBold,
        color: '#FFFFFF',
    },
    modalButtonTextSecondary: {
        ...Typography.bodyMedium,
        color: Colors.textSecondary,
    },
});
