import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useDataSelection } from '../../src/hooks/useData';
import { transactionRepository } from '../../src/db/repositories/TransactionRepository';

type TransactionType = 'expense' | 'income' | 'transfer';

export default function NewTransactionScreen() {
    const { type: initialType } = useLocalSearchParams<{ type: TransactionType }>();
    const { accounts, categories, isReady, refresh } = useDataSelection();

    const [type, setType] = useState<TransactionType>(initialType || 'expense');
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState('');
    const [toAccountId, setToAccountId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [note, setNote] = useState('');

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

        try {
            await transactionRepository.create({
                type,
                amount_cents: Math.round(parseFloat(amount.replace(',', '.')) * 100),
                account_id: accountId,
                to_account_id: type === 'transfer' ? toAccountId : undefined,
                category_id: type !== 'transfer' ? categoryId : undefined,
                note,
                happened_at: new Date().toISOString(),
            });
            await refresh();
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to save transaction.');
        }
    };

    if (!isReady) return null;

    const getTitle = () => {
        switch (type) {
            case 'income': return 'Add Income';
            case 'transfer': return 'Transfer Money';
            default: return 'Add Expense';
        }
    };

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
                    <TextInput
                        style={styles.input}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        value={amount}
                        onChangeText={setAmount}
                        autoFocus
                    />
                    <TouchableOpacity style={styles.nextButton} onPress={() => setStep(2)}>
                        <Text style={styles.nextButtonText}>Next</Text>
                    </TouchableOpacity>
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

            {/* Category Selection (for expense/income) */}
            {step === 4 && type !== 'transfer' && (
                <View style={styles.step}>
                    <Text style={styles.label}>Which category?</Text>
                    <View style={styles.grid}>
                        {filteredCategories.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.gridOption, categoryId === cat.id && styles.optionSelected]}
                                onPress={() => setCategoryId(cat.id)}
                            >
                                <Text style={[styles.optionText, categoryId === cat.id && styles.optionTextSelected]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { marginTop: 20 }]}>Optional Note</Text>
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
        padding: 24,
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
});
