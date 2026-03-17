import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useDataSelection } from '../../src/hooks/useData';
import { transactionRepository } from '../../src/db/repositories/TransactionRepository';

export default function NewTransactionScreen() {
    const { type } = useLocalSearchParams<{ type: 'expense' | 'income' }>();
    const { accounts, categories, isReady, refresh } = useDataSelection();

    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [note, setNote] = useState('');

    const filteredCategories = categories.filter(c => c.kind === type);

    const handleSave = async () => {
        if (!amount || !accountId || !categoryId) {
            Alert.alert('Missing Info', 'Please fill in all fields.');
            return;
        }

        try {
            await transactionRepository.create({
                type,
                amount_cents: Math.round(parseFloat(amount.replace(',', '.')) * 100),
                account_id: accountId,
                category_id: categoryId,
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

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Add {type === 'expense' ? 'Expense' : 'Income'}</Text>

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
                    <Text style={styles.label}>From which account?</Text>
                    {accounts.length === 0 ? (
                        <Text style={styles.emptyText}>No accounts found. Create one in Settings.</Text>
                    ) : (
                        accounts.map(acc => (
                            <TouchableOpacity
                                key={acc.id}
                                style={[styles.option, accountId === acc.id && styles.optionSelected]}
                                onPress={() => {
                                    setAccountId(acc.id);
                                    setStep(3);
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

            {step === 3 && (
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
                        placeholder="Coffee, rent, salary..."
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
        marginBottom: 32,
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
});
