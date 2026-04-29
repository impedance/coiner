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
import { router } from 'expo-router';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Category, Transaction, MonthlyBucketPlan } from '../types';
import { getBucketAvailable, getBucketState } from '../domain/budget/calculators';
import { useSettings } from '../hooks/useSettings';
import { transactionRepository } from '../db/repositories/TransactionRepository';

interface BucketSheetProps {
    visible: boolean;
    bucket: Category | null;
    plan: MonthlyBucketPlan | null;
    allBuckets: Category[];
    allPlans: MonthlyBucketPlan[];
    unassignedMoney: number;
    transactions: Transaction[];
    monthKey: string;
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
    onClose,
    onAssign,
    refreshData,
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('spend');
    const [assignAmount, setAssignAmount] = useState('');
    const [moveAmount, setMoveAmount] = useState('');
    const [sourceId, setSourceId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const { getSetting } = useSettings();

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
        (cents / 100).toLocaleString('ru-RU', { minimumFractionDigits: 0 }) + ' ₽';

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
        setSourceId(null);
        setActiveTab('spend');
        onClose();
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
                        {/* Handle */}
                        <View style={styles.handle} />

                        {/* Title */}
                        <Text style={styles.title}>{bucket.name}</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.subtitle}>
                                Assigned: {formatCents(getBucketState(bucket.id, allPlans, transactions, monthKey).assignedCents)}
                            </Text>
                            <Text style={styles.subtitle}>
                                Available: {formatCents(getBucketState(bucket.id, allPlans, transactions, monthKey).availableCents)}
                            </Text>
                        </View>

                        {/* Tabs */}
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

                        {/* Spend Tab */}
                        {activeTab === 'spend' && (
                            <View style={styles.tabContent}>
                                <Text style={styles.hint}>
                                    Recording an expense will reduce the available balance in this bucket.
                                </Text>
                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={() => {
                                        onClose();
                                        router.push(`/transaction/new?type=expense&categoryId=${bucket.id}`);
                                    }}
                                >
                                    <Text style={styles.primaryButtonText}>Record Expense</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Assign Tab */}
                        {activeTab === 'assign' && (
                            <View style={styles.tabContent}>
                                <Text style={styles.hint}>
                                    Нераспределено: {formatCents(unassignedMoney)}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder={`Текущее: ${(currentAssigned / 100).toFixed(2)}`}
                                    placeholderTextColor={Colors.textSecondary}
                                    value={assignAmount}
                                    onChangeText={text => { setAssignAmount(text); setError(''); }}
                                    autoFocus
                                />
                                {error ? <Text style={styles.error}>{error}</Text> : null}
                                <TouchableOpacity
                                    style={[styles.primaryButton, saving && styles.disabled]}
                                    onPress={handleAssign}
                                    disabled={saving}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        {saving ? 'Сохраняю…' : 'Назначить'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Move Tab */}
                        {activeTab === 'move' && (
                            <ScrollView style={styles.tabContent} keyboardShouldPersistTaps="handled">
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
                                    keyboardType="numeric"
                                    placeholder="Amount"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={moveAmount}
                                    onChangeText={text => { setMoveAmount(text); setError(''); }}
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
                            </ScrollView>
                        )}

                        {/* History Tab */}
                        {activeTab === 'transactions' && (
                            <View style={styles.tabContent}>
                                <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
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
                                </ScrollView>
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    sheetWrapper: {
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: Colors.card,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 12,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: Colors.glassBorder,
        maxHeight: '85%',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.border,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        ...Typography.h2,
        marginBottom: 4,
    },
    subtitle: {
        ...Typography.small,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: 'hsla(222, 20%, 11%, 1)',
        borderRadius: 14,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 11,
    },
    tabActive: {
        backgroundColor: Colors.primary,
    },
    tabText: {
        ...Typography.bodyMedium,
        fontSize: 14,
        color: Colors.textSecondary,
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
    tabContent: {
        flexGrow: 0,
    },
    hint: {
        ...Typography.small,
        marginBottom: 12,
    },
    label: {
        ...Typography.label,
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'hsla(222, 20%, 11%, 1)',
        borderRadius: 14,
        padding: 16,
        fontSize: 20,
        color: Colors.text,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    error: {
        ...Typography.small,
        color: Colors.expense,
        marginBottom: 12,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 4,
    },
    primaryButtonText: {
        ...Typography.bodyBold,
        color: '#FFFFFF',
        fontSize: 16,
    },
    disabled: {
        opacity: 0.5,
    },
    sourceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        backgroundColor: 'hsla(222, 20%, 11%, 1)',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sourceRowActive: {
        borderColor: Colors.primary,
        backgroundColor: 'hsla(210, 100%, 50%, 0.12)',
    },
    sourceRowText: {
        ...Typography.bodyMedium,
        fontSize: 15,
    },
    sourceRowAmount: {
        ...Typography.bodyBold,
        fontSize: 14,
        color: Colors.textSecondary,
    },
    empty: {
        ...Typography.small,
        fontStyle: 'italic',
        marginBottom: 12,
    },
    transactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    transactionNote: {
        ...Typography.bodyMedium,
        fontSize: 14,
        color: Colors.text,
    },
    transactionDate: {
        ...Typography.small,
        color: Colors.textSecondary,
        fontSize: 12,
    },
    transactionAmount: {
        ...Typography.bodyBold,
        color: Colors.expense,
        fontSize: 14,
    },
});

