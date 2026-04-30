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
    Alert,
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

export default function BucketsScreen() {
    const { isReady: isDataReady, accounts } = useDataSelection();
    const { categoryId: autoOpenCategoryId } = useLocalSearchParams<{ categoryId: string }>();

    const monthKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    const { 
        unassignedMoney, 
        plans, 
        allPlans, 
        categories, 
        categoryGroups, 
        transactions,
        loading: planningLoading, 
        assignMoney, 
        refresh 
    } = usePlanning(monthKey);

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

    useEffect(() => {
        if (Platform.OS === 'web' && isAddingBucket) {
            const handleKeyDown = (e: any) => {
                if (e.key === 'Escape') setIsAddingBucket(false);
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isAddingBucket]);

    useEffect(() => {
        if (autoOpenCategoryId && categories.length > 0) {
            const cat = categories.find(c => c.id === autoOpenCategoryId);
            if (cat) {
                setSheetBucket(cat);
            }
        }
    }, [autoOpenCategoryId, categories]);

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

    const confirmAddBucket = async () => {
        if (!newBucketName) {
            setIsAddingBucket(false);
            return;
        }
        const defaultGroup = categoryGroups.find(g => g.name === 'Variable') || categoryGroups[0];
        await categoryRepository.create({ 
            name: newBucketName, 
            group_id: defaultGroup?.id, 
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
        return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }, []);

    const formatCents = (cents: number) =>
        (cents / 100).toLocaleString() + ' ₽';

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
                <View style={styles.header}>
                    <Text style={styles.monthLabel}>{monthLabel}</Text>
                    <TouchableOpacity onPress={() => router.push('/settings' as any)}>
                        <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {showCarryForward && (
                    <TouchableOpacity onPress={handleCarryForward} activeOpacity={0.8}>
                        <GlassCard style={styles.carryForwardCard}>
                            <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
                            <View style={styles.carryForwardText}>
                                <Text style={styles.carryForwardTitle}>Starting a new month?</Text>
                                <Text style={styles.carryForwardSub}>Carry forward your plans from previous month.</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                        </GlassCard>
                    </TouchableOpacity>
                )}

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
                            onPress={() => setIsAddingBucket(true)}
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

                {categoryGroups.map(group => {
                    const groupCats = categoriesByGroup[group.id] || [];
                    if (groupCats.length === 0) return null;

                    return (
                        <View key={group.id} style={styles.groupSection}>
                            <View style={styles.groupHeader}>
                                <View style={styles.groupHeaderLine} />
                                <Text style={styles.groupName}>{group.name}</Text>
                                <View style={styles.groupHeaderLine} />
                            </View>

                            <View style={styles.bucketList}>
                                {groupCats.map(cat => {
                                    const bucketState = getBucketState(cat.id, allPlans, transactions, monthKey);
                                    const { assignedCents: assigned, spentCents: spent, availableCents: available } = bucketState;
                                    const progress = assigned > 0 ? Math.min(1, spent / assigned) : 0;
                                    
                                    let availableColor = 'transparent';
                                    let availableText = Colors.text;
                                    if (available > 0) {
                                        availableColor = 'hsla(142, 76%, 36%, 0.15)';
                                        availableText = '#4ADE80';
                                    } else if (available < 0) {
                                        availableColor = 'hsla(0, 84%, 60%, 0.15)';
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
                                                <View style={styles.bucketActions}>
                                                    <TouchableOpacity 
                                                        style={styles.bucketActionIcon}
                                                        onPress={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteBucket(cat);
                                                        }}
                                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                    >
                                                        <Ionicons name="trash-outline" size={16} color={Colors.textSecondary} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            <View style={styles.bucketValues}>
                                                <Text style={styles.valueText}>{formatCents(assigned)}</Text>
                                                <View style={[styles.availablePill, { backgroundColor: availableColor }]}>
                                                    <Text style={[styles.availableText, { color: availableText }]}>
                                                        {formatCents(available)}
                                                    </Text>
                                                </View>
                                            </View>
                                            
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
                <View style={{ height: 40 }} />
            </ScrollView>

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
                            onSubmitEditing={confirmAddBucket}
                            blurOnSubmit={false}
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

            <BucketSheet
                visible={!!sheetBucket}
                bucket={sheetBucket}
                plan={selectedPlan}
                allBuckets={categories}
                allPlans={allPlans}
                unassignedMoney={unassignedMoney}
                transactions={transactions}
                monthKey={monthKey}
                accounts={accounts}
                categoryGroups={categoryGroups}
                onClose={() => setSheetBucket(null)}
                onAssign={assignMoney}
                refreshData={refresh}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { flex: 1 },
    content: { padding: 24, paddingTop: 60, paddingBottom: 40, width: '100%', maxWidth: Layout.MAX_WIDTH, alignSelf: 'center' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    monthLabel: { ...Typography.h2, textTransform: 'capitalize' },
    carryForwardCard: { flexDirection: 'row', alignItems: 'center', padding: 18, marginBottom: 24, borderRadius: 24 },
    carryForwardText: { flex: 1, marginLeft: 16 },
    carryForwardTitle: { ...Typography.bodyBold, color: Colors.primary },
    carryForwardSub: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
    readyToAssignCard: { padding: 24, borderRadius: 32, marginBottom: 24, alignItems: 'center' },
    readyToAssignCardNegative: { borderColor: Colors.expense, backgroundColor: 'hsla(0, 84%, 60%, 0.05)' },
    readyToAssignLabel: { ...Typography.label, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
    readyToAssignAmount: { ...Typography.h1, fontSize: 44, color: '#4ADE80', marginBottom: 20 },
    readyToAssignActions: { flexDirection: 'row', gap: 12 },
    assignButton: { backgroundColor: 'hsla(142, 76%, 36%, 0.2)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, borderWidth: 1, borderColor: 'hsla(142, 76%, 36%, 0.4)' },
    addBucketButton: { backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, borderWidth: 1, borderColor: Colors.glassBorder, flexDirection: 'row', alignItems: 'center', gap: 8 },
    addBucketButtonText: { ...Typography.bodyBold, color: '#4ADE80', fontSize: 14 },
    assignButtonText: { ...Typography.bodyBold, color: '#4ADE80', fontSize: 14 },
    secondaryBalanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingHorizontal: 8 },
    secondaryBalanceLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: 4 },
    secondaryBalanceValue: { ...Typography.bodyBold, fontSize: 18 },
    miniActions: { flexDirection: 'row', gap: 10 },
    miniActionButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    bucketList: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: Colors.glassBorder },
    bucketRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
    bucketMainInfo: { flex: 1 },
    bucketNameShort: { ...Typography.bodyBold, fontSize: 16, color: Colors.text },
    bucketValues: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    valueText: { ...Typography.small, fontSize: 13, color: Colors.textSecondary, width: 60, textAlign: 'right' },
    availablePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, minWidth: 80, alignItems: 'center' },
    availableText: { ...Typography.bodyBold, fontSize: 14 },
    miniProgressContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },
    miniProgressBar: { height: '100%' },
    groupSection: { marginBottom: 32 },
    groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    groupHeaderLine: { flex: 1, height: 1, backgroundColor: Colors.glassBorder },
    groupName: { ...Typography.label, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: Colors.textSecondary },
    bucketActions: { flexDirection: 'row', gap: 12, marginTop: 6 },
    bucketActionIcon: { padding: 4, opacity: 0.6 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    backdrop: { ...StyleSheet.absoluteFillObject },
    modalCard: { width: '85%', maxWidth: 340, padding: 28, borderRadius: 32 },
    modalTitle: { ...Typography.h3, marginBottom: 20, textAlign: 'center' },
    modalInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 18, color: Colors.text, fontSize: 16, marginBottom: 24, borderWidth: 1, borderColor: Colors.glassBorder },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
    modalButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
    modalButtonPrimary: { backgroundColor: Colors.primary },
    modalButtonTextPrimary: { ...Typography.bodyBold, color: '#FFFFFF' },
    modalButtonTextSecondary: { ...Typography.bodyMedium, color: Colors.textSecondary },
});
