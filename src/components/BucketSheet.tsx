import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { 
    Category, 
    MonthlyBucketPlan, 
    Transaction,
    Account
} from '../types';
import { getBucketAvailable, getBucketState } from '../domain/budget/calculators';
import { useSettings } from '../hooks/useSettings';
import { transactionRepository } from '../db/repositories/TransactionRepository';
import { categoryRepository } from '../db/repositories/CategoryRepository';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NumberPad } from './NumberPad';
import { Colors, Typography, Layout } from '../theme';

interface BucketSheetProps {
    visible: boolean;
    bucket: Category | null;
    plan: MonthlyBucketPlan | null;
    allBuckets: Category[];
    allPlans: MonthlyBucketPlan[];
    unassignedMoney: number;
    transactions: Transaction[];
    monthKey: string;
    accounts: Account[];
    categoryGroups: any[];
    onClose: () => void;
    onAssign: (categoryId: string, amountCents: number) => Promise<void>;
    refreshData: () => Promise<void>;
}

type Tab = 'spend' | 'assign' | 'move' | 'transactions';

export const BucketSheet: React.FC<BucketSheetProps> = ({
    visible,
    bucket,
    plan,
    allBuckets,
    allPlans,
    unassignedMoney,
    transactions,
    monthKey,
    accounts,
    categoryGroups,
    onClose,
    onAssign,
    refreshData,
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('spend');
    const [assignAmount, setAssignAmount] = useState('');
    const [moveAmount, setMoveAmount] = useState('');
    const [sourceId, setSourceId] = useState<string | null>(null);
    const [spendAmount, setSpendAmount] = useState('');
    const [spendNote, setSpendNote] = useState('');
    const [spendAccountId, setSpendAccountId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(bucket?.name || '');

    React.useEffect(() => {
        if (bucket) setEditedName(bucket.name);
    }, [bucket]);

    const { getSetting } = useSettings();

    React.useEffect(() => {
        if (visible && accounts.length > 0 && !spendAccountId) {
            setSpendAccountId(getSetting('default_account_id', accounts[0].id));
        }
    }, [visible, accounts, getSetting]);

    const currentAssigned = plan?.assigned_cents ?? 0;

    const bucketsWithFunds = allBuckets.filter(b => {
        if (b.id === bucket?.id) return false;
        const available = getBucketAvailable(b.id, allPlans, transactions, monthKey);
        return available > 0;
    });

    const bucketTransactions = transactions
        .filter(tx => tx.category_id === bucket?.id && tx.happened_at.startsWith(monthKey))
        .sort((a, b) => b.happened_at.localeCompare(a.happened_at));

    const formatCents = (cents: number) =>
        (cents / 100).toLocaleString() + ' ₽';

    const handleAssign = async () => {
        setError('');
        const newAmountCents = Math.round(parseFloat(assignAmount) * 100);
        if (isNaN(newAmountCents) || newAmountCents < 0) {
            setError('Enter a valid amount');
            return;
        }
        const delta = newAmountCents - currentAssigned;
        if (delta > unassignedMoney) {
            setError('Not enough unassigned funds');
            return;
        }
        setSaving(true);
        try {
            await onAssign(bucket!.id, newAmountCents);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const handleSpend = async () => {
        setError('');
        const amountCents = Math.round(parseFloat(spendAmount) * 100);
        if (isNaN(amountCents) || amountCents <= 0) {
            setError('Enter a valid amount');
            return;
        }
        
        if (!spendAccountId) {
            setError('Select an account');
            return;
        }

        setSaving(true);
        try {
            await transactionRepository.create({
                type: 'expense',
                amount_cents: amountCents,
                account_id: spendAccountId,
                category_id: bucket!.id,
                note: spendNote || `Spend from ${bucket?.name}`,
                happened_at: new Date().toISOString(),
            });
            await refreshData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            handleClose();
        } catch (e) {
            setError('Failed to record expense');
        } finally {
            setSaving(false);
        }
    };

    const handleMove = async () => {
        setError('');
        if (!sourceId) {
            setError('Select a source bucket');
            return;
        }
        const deltaCents = Math.round(parseFloat(moveAmount) * 100);
        if (isNaN(deltaCents) || deltaCents <= 0) {
            setError('Enter a valid amount');
            return;
        }
        const sourceAvailable = getBucketAvailable(sourceId, allPlans, transactions, monthKey);
        if (deltaCents > sourceAvailable) {
            setError('Insufficient funds in source');
            return;
        }
        setSaving(true);
        try {
            const sourcePlan = allPlans.find(p => p.category_id === sourceId && p.month_key === monthKey);
            const sourceAssigned = sourcePlan?.assigned_cents ?? 0;
            await onAssign(sourceId, sourceAssigned - deltaCents);
            await onAssign(bucket!.id, currentAssigned + deltaCents);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setError('');
        setAssignAmount('');
        setMoveAmount('');
        setSpendAmount('');
        setSpendNote('');
        setSourceId(null);
        setSpendAccountId(null);
        setActiveTab('spend');
        setIsEditingName(false);
        onClose();
    };

    const handleRename = async () => {
        if (!editedName || editedName === bucket?.name) {
            setIsEditingName(false);
            return;
        }
        setSaving(true);
        try {
            const defaultGroup = categoryGroups.find(g => g.name === 'Variable') || categoryGroups[0];
            await categoryRepository.update(bucket!.id, { name: editedName, group_id: defaultGroup?.id });
            await refreshData();
            setIsEditingName(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
            setError('Failed to rename bucket');
        } finally {
            setSaving(false);
        }
    };

    if (!bucket) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={handleClose} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.sheetWrapper}
                >
                    <View style={styles.sheet}>
                        <View style={styles.handle} />

                        <View style={styles.titleContainer}>
                            {isEditingName ? (
                                <View style={styles.renameContainer}>
                                    <TextInput
                                        style={styles.renameInput}
                                        value={editedName}
                                        onChangeText={setEditedName}
                                        autoFocus
                                        onBlur={handleRename}
                                        onSubmitEditing={handleRename}
                                    />
                                    <TouchableOpacity onPress={handleRename}>
                                        <Ionicons name="checkmark-circle" size={24} color={Colors.income} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity 
                                    style={styles.titleRow} 
                                    onPress={() => {
                                        setEditedName(bucket.name);
                                        setIsEditingName(true);
                                    }}
                                >
                                    <Text style={styles.title}>{bucket.name}</Text>
                                    <Ionicons name="create-outline" size={18} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.subtitle}>
                                Assigned: {formatCents(getBucketState(bucket.id, allPlans, transactions, monthKey).assignedCents)}
                            </Text>
                            <Text style={styles.subtitle}>
                                Available: {formatCents(getBucketState(bucket.id, allPlans, transactions, monthKey).availableCents)}
                            </Text>
                        </View>

                        <View style={styles.tabs}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'spend' && styles.tabActive]}
                                onPress={() => setActiveTab('spend')}
                            >
                                <Text style={[styles.tabText, activeTab === 'spend' && styles.tabTextActive]}>
                                    Spend
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'assign' && styles.tabActive]}
                                onPress={() => setActiveTab('assign')}
                            >
                                <Text style={[styles.tabText, activeTab === 'assign' && styles.tabTextActive]}>
                                    Assign
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'move' && styles.tabActive]}
                                onPress={() => setActiveTab('move')}
                            >
                                <Text style={[styles.tabText, activeTab === 'move' && styles.tabTextActive]}>
                                    Move
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'transactions' && styles.tabActive]}
                                onPress={() => setActiveTab('transactions')}
                            >
                                <Text style={[styles.tabText, activeTab === 'transactions' && styles.tabTextActive]}>
                                    History
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {activeTab === 'spend' && (
                                <View style={styles.tabContent}>
                                    <TextInput
                                        style={styles.input}
                                        showSoftInputOnFocus={false}
                                        placeholder="0.00"
                                        placeholderTextColor={Colors.textSecondary}
                                        value={spendAmount}
                                        onChangeText={text => { setSpendAmount(text); setError(''); }}
                                        autoFocus
                                    />
                                    <TextInput
                                        style={[styles.input, { fontSize: 16, padding: 12 }]}
                                        placeholder="Note (optional)"
                                        placeholderTextColor={Colors.textSecondary}
                                        value={spendNote}
                                        onChangeText={setSpendNote}
                                    />
                                    
                                    <Text style={styles.label}>Account</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountChips}>
                                        {accounts.map(acc => (
                                            <TouchableOpacity
                                                key={acc.id}
                                                style={[styles.chip, spendAccountId === acc.id && styles.chipActive]}
                                                onPress={() => setSpendAccountId(acc.id)}
                                            >
                                                <Text style={[styles.chipText, spendAccountId === acc.id && styles.chipTextActive]}>
                                                    {acc.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <NumberPad 
                                        value={spendAmount} 
                                        onChange={(val) => { setSpendAmount(val); setError(''); }} 
                                    />
                                    {error ? <Text style={styles.error}>{error}</Text> : null}
                                    <TouchableOpacity
                                        style={[styles.primaryButton, { backgroundColor: Colors.expense }, saving && styles.disabled]}
                                        onPress={handleSpend}
                                        disabled={saving}
                                    >
                                        <Text style={styles.primaryButtonText}>
                                            {saving ? 'Recording…' : 'Record Expense'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}


                            {activeTab === 'assign' && (
                                <View style={styles.tabContent}>
                                    <Text style={styles.hint}>
                                        Unassigned: {formatCents(unassignedMoney)}
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        showSoftInputOnFocus={false}
                                        placeholder={`Current: ${(currentAssigned / 100).toFixed(2)}`}
                                        placeholderTextColor={Colors.textSecondary}
                                        value={assignAmount}
                                        onChangeText={text => { setAssignAmount(text); setError(''); }}
                                        autoFocus
                                    />
                                    <NumberPad 
                                        value={assignAmount} 
                                        onChange={(val) => { setAssignAmount(val); setError(''); }} 
                                    />
                                    {error ? <Text style={styles.error}>{error}</Text> : null}
                                    <TouchableOpacity
                                        style={[styles.primaryButton, saving && styles.disabled]}
                                        onPress={handleAssign}
                                        disabled={saving}
                                    >
                                        <Text style={styles.primaryButtonText}>
                                            {saving ? 'Saving…' : 'Assign'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {activeTab === 'move' && (
                                <View style={styles.tabContent}>
                                    <Text style={styles.label}>From</Text>
                                    {bucketsWithFunds.length === 0 ? (
                                        <Text style={styles.empty}>No buckets with available funds</Text>
                                    ) : (
                                        bucketsWithFunds.map(b => {
                                            const avail = getBucketAvailable(b.id, allPlans, transactions, monthKey);
                                            return (
                                                <TouchableOpacity
                                                    key={b.id}
                                                    style={[styles.sourceRow, sourceId === b.id && styles.sourceRowActive]}
                                                    onPress={() => setSourceId(b.id)}
                                                >
                                                    <Text style={styles.sourceRowText}>{b.name}</Text>
                                                    <Text style={styles.sourceRowAmount}>{formatCents(avail)}</Text>
                                                </TouchableOpacity>
                                            );
                                        })
                                    )}

                                    <Text style={[styles.label, { marginTop: 16 }]}>To: {bucket.name}</Text>
                                    <TextInput
                                        style={styles.input}
                                        showSoftInputOnFocus={false}
                                        placeholder="Amount"
                                        placeholderTextColor={Colors.textSecondary}
                                        value={moveAmount}
                                        onChangeText={text => { setMoveAmount(text); setError(''); }}
                                    />
                                    <NumberPad 
                                        value={moveAmount} 
                                        onChange={(val) => { setMoveAmount(val); setError(''); }} 
                                    />
                                    {error ? <Text style={styles.error}>{error}</Text> : null}
                                    <TouchableOpacity
                                        style={[styles.primaryButton, saving && styles.disabled]}
                                        onPress={handleMove}
                                        disabled={saving}
                                    >
                                        <Text style={styles.primaryButtonText}>
                                            {saving ? 'Moving…' : 'Move Money'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {activeTab === 'transactions' && (
                                <View style={styles.tabContent}>
                                    {bucketTransactions.length === 0 ? (
                                        <Text style={styles.empty}>No transactions for this bucket yet.</Text>
                                    ) : (
                                        bucketTransactions.map(tx => (
                                            <View key={tx.id} style={styles.transactionRow}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.transactionNote} numberOfLines={1}>
                                                        {tx.note || 'No note'}
                                                    </Text>
                                                    <Text style={styles.transactionDate}>
                                                        {new Date(tx.happened_at).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                                <Text style={styles.transactionAmount}>
                                                    -{formatCents(tx.amount_cents)}
                                                </Text>
                                            </View>
                                        ))
                                    )}
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheetWrapper: { justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
    sheet: { backgroundColor: Colors.card, borderRadius: 32, paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12, borderWidth: 1, borderColor: Colors.glassBorder, maxHeight: '85%', width: '92%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 20 },
    titleContainer: { marginBottom: 8 },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    renameContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    renameInput: { ...Typography.h2, flex: 1, borderBottomWidth: 1, borderBottomColor: Colors.primary, paddingVertical: 4, color: Colors.text },
    title: { ...Typography.h2 },
    subtitle: { ...Typography.small, color: Colors.textSecondary },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    tabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 4, marginBottom: 20 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    tabActive: { backgroundColor: Colors.primary },
    tabText: { ...Typography.bodyMedium, fontSize: 13, color: Colors.textSecondary },
    tabTextActive: { color: '#FFFFFF', fontWeight: '800' },
    tabContent: { paddingBottom: 20 },
    hint: { ...Typography.small, marginBottom: 12, color: Colors.income },
    label: { ...Typography.label, marginBottom: 8, color: Colors.textSecondary },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 18, fontSize: 24, color: Colors.text, marginBottom: 12, borderWidth: 1, borderColor: Colors.glassBorder, textAlign: 'center' },
    error: { ...Typography.small, color: Colors.expense, marginBottom: 12, textAlign: 'center' },
    primaryButton: { backgroundColor: Colors.primary, borderRadius: 20, padding: 20, alignItems: 'center', marginTop: 10 },
    primaryButtonText: { ...Typography.bodyBold, color: '#FFFFFF', fontSize: 16 },
    disabled: { opacity: 0.5 },
    sourceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)', marginBottom: 8, borderWidth: 1, borderColor: Colors.glassBorder },
    sourceRowActive: { borderColor: Colors.primary, backgroundColor: 'hsla(210, 100%, 50%, 0.1)' },
    sourceRowText: { ...Typography.bodyMedium, fontSize: 16 },
    sourceRowAmount: { ...Typography.bodyBold, fontSize: 14, color: Colors.income },
    empty: { ...Typography.small, fontStyle: 'italic', marginBottom: 12, textAlign: 'center', padding: 20 },
    transactionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
    transactionNote: { ...Typography.bodyMedium, fontSize: 15, color: Colors.text },
    transactionDate: { ...Typography.small, color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
    transactionAmount: { ...Typography.bodyBold, color: Colors.expense, fontSize: 15 },
    accountChips: { flexDirection: 'row', marginBottom: 20 },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 10, borderWidth: 1, borderColor: Colors.glassBorder },
    chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    chipText: { ...Typography.small, color: Colors.textSecondary },
    chipTextActive: { color: '#FFFFFF', fontWeight: '800' },
});
