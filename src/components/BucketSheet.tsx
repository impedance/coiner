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
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Category } from '../types';
import { MonthlyBucketPlan } from '../types';
import { useSettings } from '../hooks/useSettings';
import { transactionRepository } from '../db/repositories/TransactionRepository';

interface BucketSheetProps {
    visible: boolean;
    bucket: Category | null;
    plan: MonthlyBucketPlan | null;
    allBuckets: Category[];
    allPlans: MonthlyBucketPlan[];
    unassignedMoney: number;
    onClose: () => void;
    onAssign: (categoryId: string, amountCents: number) => Promise<void>;
    refreshData: () => Promise<void>;
}

type Tab = 'spend' | 'assign' | 'move' | 'topup';

export const BucketSheet: React.FC<BucketSheetProps> = ({
    visible,
    bucket,
    plan,
    allBuckets,
    allPlans,
    unassignedMoney,
    onClose,
    onAssign,
    refreshData,
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('spend');
    const [spendAmount, setSpendAmount] = useState('');
    const [topupAmount, setTopupAmount] = useState('');
    const [assignAmount, setAssignAmount] = useState('');
    const [moveAmount, setMoveAmount] = useState('');
    const [sourceId, setSourceId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const { getSetting } = useSettings();

    const currentAssigned = plan?.assigned_cents ?? 0;

    const bucketsWithFunds = allBuckets.filter(b => {
        if (b.id === bucket?.id) return false;
        const p = allPlans.find(pl => pl.category_id === b.id);
        return (p?.assigned_cents ?? 0) > 0;
    });

    const formatCents = (cents: number) =>
        (cents / 100).toLocaleString('ru-RU', { minimumFractionDigits: 0 }) + ' ₽';

    const handleSpend = async () => {
        setError('');
        const amountCents = Math.round(parseFloat(spendAmount.replace(',', '.')) * 100);
        if (isNaN(amountCents) || amountCents <= 0) {
            setError('Введите корректную сумму');
            return;
        }
        const accountId = getSetting('default_account_id', '');
        if (!accountId) {
            setError('Настройте счет по умолчанию в настройках');
            return;
        }
        setSaving(true);
        try {
            await transactionRepository.create({
                type: 'expense',
                amount_cents: amountCents,
                account_id: accountId,
                category_id: bucket!.id,
                happened_at: new Date().toISOString(),
            });
            await refreshData();
            handleClose();
        } catch (e) {
            setError('Ошибка при сохранении');
        } finally {
            setSaving(false);
        }
    };

    const handleTopup = async () => {
        setError('');
        const amountCents = Math.round(parseFloat(topupAmount.replace(',', '.')) * 100);
        if (isNaN(amountCents) || amountCents <= 0) {
            setError('Введите корректную сумму');
            return;
        }
        const accountId = getSetting('default_account_id', '');
        if (!accountId) {
            setError('Настройте счет по умолчанию в настройках');
            return;
        }
        setSaving(true);
        try {
            await transactionRepository.create({
                type: 'income',
                amount_cents: amountCents,
                account_id: accountId,
                category_id: bucket!.id,
                happened_at: new Date().toISOString(),
            });
            await onAssign(bucket!.id, currentAssigned + amountCents);
            await refreshData();
            handleClose();
        } catch (e) {
            setError('Ошибка при сохранении');
        } finally {
            setSaving(false);
        }
    };

    const handleAssign = async () => {
        setError('');
        const newAmountCents = Math.round(parseFloat(assignAmount) * 100);
        if (isNaN(newAmountCents) || newAmountCents < 0) {
            setError('Введите корректную сумму');
            return;
        }
        const delta = newAmountCents - currentAssigned;
        if (delta > unassignedMoney) {
            setError('Недостаточно нераспределённых средств');
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
            setError('Выберите источник');
            return;
        }
        const deltaCents = Math.round(parseFloat(moveAmount) * 100);
        if (isNaN(deltaCents) || deltaCents <= 0) {
            setError('Введите корректную сумму');
            return;
        }
        const sourcePlan = allPlans.find(p => p.category_id === sourceId);
        const sourceAssigned = sourcePlan?.assigned_cents ?? 0;
        if (deltaCents > sourceAssigned) {
            setError('Недостаточно средств в источнике');
            return;
        }
        setSaving(true);
        try {
            await onAssign(sourceId, sourceAssigned - deltaCents);
            await onAssign(bucket!.id, currentAssigned + deltaCents);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setError('');
        setSpendAmount('');
        setTopupAmount('');
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
                        <Text style={styles.subtitle}>
                            Назначено: {formatCents(currentAssigned)}
                        </Text>

                        {/* Tabs */}
                        <View style={styles.tabs}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'spend' && styles.tabActive]}
                                onPress={() => setActiveTab('spend')}
                            >
                                <Text style={[styles.tabText, activeTab === 'spend' && styles.tabTextActive]}>
                                    Трата
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'assign' && styles.tabActive]}
                                onPress={() => setActiveTab('assign')}
                            >
                                <Text style={[styles.tabText, activeTab === 'assign' && styles.tabTextActive]}>
                                    Назначить
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'move' && styles.tabActive]}
                                onPress={() => setActiveTab('move')}
                            >
                                <Text style={[styles.tabText, activeTab === 'move' && styles.tabTextActive]}>
                                    Двигать
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'topup' && styles.tabActive]}
                                onPress={() => setActiveTab('topup')}
                            >
                                <Text style={[styles.tabText, activeTab === 'topup' && styles.tabTextActive]}>
                                    Доход
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Spend Tab */}
                        {activeTab === 'spend' && (
                            <View style={styles.tabContent}>
                                <Text style={styles.hint}>
                                    Внести трату из счета по умолчанию
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="Сумма траты"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={spendAmount}
                                    onChangeText={text => { setSpendAmount(text); setError(''); }}
                                    autoFocus
                                />
                                {error ? <Text style={styles.error}>{error}</Text> : null}
                                <TouchableOpacity
                                    style={[styles.primaryButton, saving && styles.disabled]}
                                    onPress={handleSpend}
                                    disabled={saving}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        {saving ? 'Сохраняю…' : 'Внести трату'}
                                    </Text>
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
                                <Text style={styles.label}>Откуда</Text>
                                {bucketsWithFunds.length === 0 ? (
                                    <Text style={styles.empty}>Нет бакетов с доступными средствами</Text>
                                ) : (
                                    bucketsWithFunds.map(b => {
                                        const p = allPlans.find(pl => pl.category_id === b.id);
                                        const avail = p?.assigned_cents ?? 0;
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

                                <Text style={[styles.label, { marginTop: 16 }]}>Куда: {bucket.name}</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="Сумма"
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
                                        {saving ? 'Перемещаю…' : 'Переместить'}
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}

                        {/* Topup Tab */}
                        {activeTab === 'topup' && (
                            <View style={styles.tabContent}>
                                <Text style={styles.hint}>
                                    Добавить доход и сразу зачислить в бакет
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="Сумма дохода"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={topupAmount}
                                    onChangeText={text => { setTopupAmount(text); setError(''); }}
                                    autoFocus
                                />
                                {error ? <Text style={styles.error}>{error}</Text> : null}
                                <TouchableOpacity
                                    style={[styles.primaryButton, saving && styles.disabled, { backgroundColor: Colors.income }]}
                                    onPress={handleTopup}
                                    disabled={saving}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        {saving ? 'Зачисляю…' : 'Пополнить бакет'}
                                    </Text>
                                </TouchableOpacity>
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
});
