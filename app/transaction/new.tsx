import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useDataSelection } from '../../src/hooks/useData';
import { useSettings } from '../../src/hooks/useSettings';
import { transactionRepository } from '../../src/db/repositories/TransactionRepository';
import { getBucketAvailable } from '../../src/domain/budget/calculators';
import { Colors, Layout } from '../../src/theme';
import { NumberPad } from '../../src/components/NumberPad';

type TransactionType = 'expense' | 'income' | 'transfer';

export default function NewTransactionScreen() {
    const { type: initialType, categoryId: initialCategoryId } = useLocalSearchParams<{ type: TransactionType; categoryId: string }>();
    const { accounts, categories, plans, transactions, goals, moneySteps, isReady, refresh } = useDataSelection();
    const { getSetting } = useSettings();

    const [type, setType] = useState<TransactionType>(initialType || 'expense');
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState('');
    const [toAccountId, setToAccountId] = useState('');
    const [categoryId, setCategoryId] = useState(initialCategoryId || '');
    const [note, setNote] = useState('');
    const [goalId, setGoalId] = useState<string | null>(null);
    const [moneyStepId, setMoneyStepId] = useState<string | null>(null);

    const { settings, loading: settingsLoading } = useSettings();

    const monthKey = new Date().toISOString().substring(0, 7);

    useEffect(() => {
        if (!accountId && !settingsLoading) {
            setAccountId(getSetting('default_account_id', ''));
        }
    }, [settingsLoading, accountId, getSetting]);

    const filteredCategories = categories.filter(c => c.kind === type || (type === 'transfer' && c.kind === 'expense'));

    const handleSave = async () => {
        if (!amount || !accountId) {
            Alert.alert('Missing Info', 'Please fill in all required fields.');
            return;
        }

        if (type === 'transfer' && !toAccountId) {
            Alert.alert('Missing Info', 'Please select a destination account.');
            return;
        }

        if (type !== 'transfer' && !categoryId) {
            Alert.alert('Missing Info', 'Please select a category.');
            return;
        }

        const amountCents = Math.round(parseFloat(amount.replace(',', '.')) * 100);
        const available = getBucketAvailable(categoryId, plans, transactions, monthKey);
        const isOverspent = type === 'expense' && amountCents > available;

        try {
            await transactionRepository.create({
                type,
                amount_cents: amountCents,
                account_id: accountId,
                to_account_id: type === 'transfer' ? toAccountId : undefined,
                category_id: type !== 'transfer' ? categoryId : undefined,
                note,
                goal_id: goalId || undefined,
                money_step_id: moneyStepId || undefined,
                happened_at: new Date().toISOString(),
            });
            await refresh();
            
            if (type === 'income') {
                Alert.alert(
                    'Income Recorded',
                    'Would you like to assign this money to your buckets now?',
                    [
                        { text: 'Later', onPress: () => router.back() },
                        { text: 'Assign Now', onPress: () => router.replace(`/transaction/income-wizard?amountCents=${amountCents}`) }
                    ]
                );
            } else if (isOverspent) {
                Alert.alert(
                    'Overspent!',
                    'You spent more than you had in this bucket. Move money to cover it?',
                    [
                        { text: 'Later', onPress: () => router.back() },
                        { text: 'Move Money', onPress: () => {
                            router.replace({ pathname: '/', params: { categoryId } });
                        }}
                    ]
                );
            } else {
                router.back();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to save transaction.');
        }
    };

    const skipToCategory = initialCategoryId && step === 1;

    if (!isReady || settingsLoading) return null;

    const getTitle = () => {
        switch (type) {
            case 'income': return 'Add Income';
            case 'transfer': return 'Transfer Money';
            default: return 'Add Expense';
        }
    };

    const renderAccountChips = () => (
        <View style={styles.chipsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {accounts.map(acc => (
                    <TouchableOpacity
                        key={acc.id}
                        style={[styles.chip, accountId === acc.id && styles.chipActive]}
                        onPress={() => {
                            setAccountId(acc.id);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                    >
                        <Text style={[styles.chipText, accountId === acc.id && styles.chipTextActive]}>
                            {acc.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>{getTitle()}</Text>

            {/* Type Selector */}
            <View style={styles.typeSelector}>
                <TouchableOpacity
                    style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
                    onPress={() => setType('expense')}
                >
                    <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
                    onPress={() => setType('income')}
                >
                    <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.typeButton, type === 'transfer' && styles.typeButtonActive]}
                    onPress={() => setType('transfer')}
                >
                    <Text style={[styles.typeButtonText, type === 'transfer' && styles.typeButtonTextActive]}>Transfer</Text>
                </TouchableOpacity>
            </View>

            {step === 1 && (
                <View style={styles.step}>
                    <Text style={styles.label}>How much?</Text>
                    {renderAccountChips()}
                    <TextInput
                        style={styles.input}
                        showSoftInputOnFocus={false}
                        placeholder="0.00"
                        value={amount}
                        onChangeText={setAmount}
                        autoFocus
                    />
                    <NumberPad value={amount} onChange={setAmount} />
                    
                    {initialCategoryId ? (
                        <TouchableOpacity 
                            style={styles.saveButton} 
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>Save to {categories.find(c => c.id === categoryId)?.name}</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity 
                            style={styles.nextButton} 
                            onPress={() => setStep(accountId ? (type === 'transfer' ? 3 : 4) : 2)}
                        >
                            <Text style={styles.nextButtonText}>Next</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {step === 2 && (
                <View style={styles.step}>
                    <Text style={styles.label}>
                        {type === 'transfer' ? 'From which account?' : 'Which account?'}
                    </Text>
                    {accounts.length === 0 ? (
                        <Text style={styles.emptyText}>No accounts found. Create one in Settings.</Text>
                    ) : (
                        accounts.map(acc => (
                            <TouchableOpacity
                                key={acc.id}
                                style={[styles.option, accountId === acc.id && styles.optionSelected]}
                                onPress={() => {
                                    setAccountId(acc.id);
                                    setStep(type === 'transfer' ? 3 : 4);
                                }}
                            >
                                <Text style={[styles.optionText, accountId === acc.id && styles.optionTextSelected]}>
                                    {acc.name}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                    <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Transfer: To Account Selection */}
            {step === 3 && type === 'transfer' && (
                <View style={styles.step}>
                    <Text style={styles.label}>To which account?</Text>
                    {accounts.filter(a => a.id !== accountId).length === 0 ? (
                        <Text style={styles.emptyText}>Need at least 2 accounts for transfer.</Text>
                    ) : (
                        accounts.filter(a => a.id !== accountId).map(acc => (
                            <TouchableOpacity
                                key={acc.id}
                                style={[styles.option, toAccountId === acc.id && styles.optionSelected]}
                                onPress={() => {
                                    setToAccountId(acc.id);
                                    setStep(5);
                                }}
                            >
                                <Text style={[styles.optionText, toAccountId === acc.id && styles.optionTextSelected]}>
                                    {acc.name}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                    <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Category Selection (for expense/income) + Optional Links */}
            {step === 4 && type !== 'transfer' && (
                <View style={styles.step}>
                    <View style={styles.grid}>
                        {filteredCategories.map(cat => {
                            const available = getBucketAvailable(cat.id, plans, transactions, monthKey);
                            const isSelected = categoryId === cat.id;
                            
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.gridOption, isSelected && styles.optionSelected]}
                                    onPress={() => setCategoryId(cat.id)}
                                >
                                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                        {cat.name}
                                    </Text>
                                    <Text style={[styles.availableText, isSelected && styles.availableTextSelected]}>
                                        {(available / 100).toFixed(0)} ₽
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {categoryId && type === 'expense' && amount && (
                        <View style={styles.previewContainer}>
                            {(() => {
                                const currentAmount = Math.round(parseFloat(amount.replace(',', '.')) * 100);
                                const available = getBucketAvailable(categoryId, plans, transactions, monthKey);
                                const remaining = available - currentAmount;
                                const isWarning = remaining < 0;
                                
                                return (
                                    <View style={[styles.previewCard, isWarning && styles.warningCard]}>
                                        <Text style={[styles.previewLabel, isWarning && styles.warningLabel]}>
                                            {isWarning ? '⚠️ Overspending' : 'Remaining After'}
                                        </Text>
                                        <Text style={[styles.previewAmount, isWarning && styles.warningAmount]}>
                                            {(remaining / 100).toLocaleString('ru-RU')} ₽
                                        </Text>
                                    </View>
                                );
                            })()}
                        </View>
                    )}

                    {/* Optional Goal Linking */}
                    {goals.length > 0 && (
                        <>
                            <Text style={[styles.label, { marginTop: 24, fontSize: 16 }]}>Link to Goal (Optional)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, paddingHorizontal: 24 }}>
                                <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 8 }}>
                                    <TouchableOpacity 
                                        style={[styles.smallOption, !goalId && styles.smallOptionSelected]}
                                        onPress={() => setGoalId(null)}
                                    >
                                        <Text style={[styles.smallOptionText, !goalId && styles.smallOptionTextSelected]}>None</Text>
                                    </TouchableOpacity>
                                    {goals.map(g => (
                                        <TouchableOpacity 
                                            key={g.id}
                                            style={[styles.smallOption, goalId === g.id && styles.smallOptionSelected]}
                                            onPress={() => setGoalId(g.id)}
                                        >
                                            <Text style={[styles.smallOptionText, goalId === g.id && styles.smallOptionTextSelected]}>{g.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </>
                    )}

                    {/* Optional Money Step Linking */}
                    {moneySteps.length > 0 && (
                        <>
                            <Text style={[styles.label, { marginTop: 16, fontSize: 16 }]}>Link to Money Step (Optional)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, paddingHorizontal: 24 }}>
                                <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 8 }}>
                                    <TouchableOpacity 
                                        style={[styles.smallOption, !moneyStepId && styles.smallOptionSelected]}
                                        onPress={() => setMoneyStepId(null)}
                                    >
                                        <Text style={[styles.smallOptionText, !moneyStepId && styles.smallOptionTextSelected]}>None</Text>
                                    </TouchableOpacity>
                                    {moneySteps.map(s => (
                                        <TouchableOpacity 
                                            key={s.id}
                                            style={[styles.smallOption, moneyStepId === s.id && styles.smallOptionSelected]}
                                            onPress={() => setMoneyStepId(s.id)}
                                        >
                                            <Text style={[styles.smallOptionText, moneyStepId === s.id && styles.smallOptionTextSelected]}>{s.title}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </>
                    )}

                    <Text style={[styles.label, { marginTop: 24 }]}>Optional Note</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={type === 'expense' ? "Coffee, rent, groceries..." : "Salary, gift, refund..."}
                        value={note}
                        onChangeText={setNote}
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save Transaction</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                </View>
            )}


            {/* Transfer Summary Step */}
            {step === 5 && type === 'transfer' && (
                <View style={styles.step}>
                    <Text style={styles.label}>Transfer Details</Text>
                    <View style={styles.transferSummary}>
                        <Text style={styles.transferText}>
                            {amount ? `${parseFloat(amount).toFixed(2)} €` : '0.00 €'}
                        </Text>
                        <Text style={styles.transferLabel}>From: {accounts.find(a => a.id === accountId)?.name}</Text>
                        <Text style={styles.transferLabel}>To: {accounts.find(a => a.id === toAccountId)?.name}</Text>
                    </View>

                    <Text style={[styles.label, { marginTop: 20 }]}>Optional Note</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Transfer note..."
                        value={note}
                        onChangeText={setNote}
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Confirm Transfer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.backButton} onPress={() => setStep(3)}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        padding: Layout.PADDING,
        width: '100%',
        maxWidth: Layout.MAX_WIDTH,
        alignSelf: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    typeButton: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
    },
    typeButtonActive: {
        backgroundColor: '#007AFF',
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3A3A3C',
    },
    typeButtonTextActive: {
        color: '#FFFFFF',
    },
    step: {
        gap: 16,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3A3A3C',
    },
    input: {
        fontSize: 32,
        borderBottomWidth: 2,
        borderBottomColor: '#007AFF',
        paddingVertical: 8,
        color: '#000',
    },
    option: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F2F2F7',
        marginBottom: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    gridOption: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F2F2F7',
        minWidth: '30%',
        alignItems: 'center',
    },
    optionSelected: {
        backgroundColor: '#007AFF',
    },
    optionText: {
        fontSize: 16,
        color: '#000',
    },
    optionTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    smallOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    smallOptionSelected: {
        backgroundColor: '#E5E5EA',
        borderColor: '#007AFF',
    },
    smallOptionText: {
        fontSize: 14,
        color: '#000',
    },
    smallOptionTextSelected: {
        color: '#007AFF',
        fontWeight: '700',
    },
    nextButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#34C759',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 32,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    backButton: {
        padding: 12,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#8E8E93',
        fontSize: 16,
    },
    emptyText: {
        color: '#FF3B30',
        marginBottom: 10,
    },
    availableText: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    availableTextSelected: {
        color: 'rgba(255,255,255,0.7)',
    },
    previewContainer: {
        marginTop: 16,
    },
    previewCard: {
        backgroundColor: '#F2F2F7',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    warningCard: {
        backgroundColor: '#FF3B3015',
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    previewLabel: {
        fontSize: 14,
        color: '#3A3A3C',
        fontWeight: '500',
    },
    warningLabel: {
        color: '#FF3B30',
        fontWeight: '700',
    },
    previewAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#007AFF',
    },
    warningAmount: {
        color: '#FF3B30',
    },
    transferSummary: {
        backgroundColor: '#F2F2F7',
        padding: 20,
        borderRadius: 12,
        gap: 8,
    },
    transferText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 12,
    },
    transferLabel: {
        fontSize: 16,
        color: '#3A3A3C',
    },
    // Chips
    chipsContainer: {
        marginVertical: 8,
    },
    chipsScroll: {
        gap: 8,
        paddingRight: 24,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3A3A3C',
    },
    chipTextActive: {
        color: '#FFFFFF',
    },
});
