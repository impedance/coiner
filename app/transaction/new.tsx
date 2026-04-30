import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useDataSelection } from '../../src/hooks/useData';
import { useSettings } from '../../src/hooks/useSettings';
import { transactionRepository } from '../../src/db/repositories/TransactionRepository';
import { getBucketAvailable } from '../../src/domain/budget/calculators';
import { Colors, Typography, Layout } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { NumberPad } from '../../src/components/NumberPad';
import { Ionicons } from '@expo/vector-icons';

type TransactionType = 'expense' | 'income' | 'transfer';

export default function NewTransactionScreen() {
    const { type: initialType, categoryId: initialCategoryId } = useLocalSearchParams<{ type: TransactionType; categoryId: string }>();
    const { accounts, categories, plans, transactions, goals, moneySteps, isReady, refresh } = useDataSelection();
    const { getSetting } = useSettings();
    const primaryCurrency = getSetting('primary_currency', 'RUB');
    const currencySymbol = primaryCurrency === 'RUB' ? '₽' : (primaryCurrency === 'USD' ? '$' : '€');

    const [type, setType] = useState<TransactionType>(initialType || 'expense');
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState('');
    const [toAccountId, setToAccountId] = useState('');
    const [categoryId, setCategoryId] = useState(initialCategoryId || '');
    const [note, setNote] = useState('');
    const [goalId, setGoalId] = useState<string | null>(null);
    const [moneyStepId, setMoneyStepId] = useState<string | null>(null);

    const monthKey = new Date().toISOString().substring(0, 7);

    useEffect(() => {
        if (!accountId && isReady) {
            setAccountId(getSetting('default_account_id', accounts[0]?.id || ''));
        }
    }, [isReady, accounts, getSetting]);

    useEffect(() => {
        if (Platform.OS === 'web') {
            const handleKeyDown = (e: any) => {
                if (e.key === 'Escape') router.back();
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

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

    if (!isReady) return null;

    const renderAccountChips = (selected: string, onSelect: (id: string) => void) => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {accounts.map(acc => (
                <TouchableOpacity
                    key={acc.id}
                    style={[styles.chip, selected === acc.id && styles.chipActive]}
                    onPress={() => {
                        onSelect(acc.id);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                >
                    <Text style={[styles.chipText, selected === acc.id && styles.chipTextActive]}>
                        {acc.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="close" size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New {type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </View>

            <View style={styles.typeSelector}>
                {(['expense', 'income', 'transfer'] as TransactionType[]).map(t => (
                    <TouchableOpacity
                        key={t}
                        style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                        onPress={() => setType(t)}
                    >
                        <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {step === 1 && (
                    <View style={styles.step}>
                        <Text style={styles.label}>Amount</Text>
                        <View style={styles.amountContainer}>
                            <Text style={styles.amountText}>{amount || '0'}</Text>
                            <Text style={styles.amountCurrency}>{currencySymbol}</Text>
                        </View>
                        
                        <Text style={styles.label}>Account</Text>
                        {renderAccountChips(accountId, setAccountId)}

                        <View style={{ marginTop: 24 }}>
                            <NumberPad value={amount} onChange={setAmount} />
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.primaryBtn} 
                            onPress={() => {
                                if (!amount) return;
                                if (type === 'transfer') setStep(3);
                                else setStep(4);
                            }}
                        >
                            <Text style={styles.primaryBtnText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {step === 3 && type === 'transfer' && (
                    <View style={styles.step}>
                        <Text style={styles.label}>To Account</Text>
                        {renderAccountChips(toAccountId, setToAccountId)}
                        
                        <Text style={[styles.label, { marginTop: 24 }]}>Note</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Optional note..."
                            placeholderTextColor={Colors.textSecondary}
                            value={note}
                            onChangeText={setNote}
                            onSubmitEditing={handleSave}
                        />

                        <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
                            <Text style={styles.primaryBtnText}>Confirm Transfer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep(1)}>
                            <Text style={styles.secondaryBtnText}>Back</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {step === 4 && type !== 'transfer' && (
                    <View style={styles.step}>
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.categoryGrid}>
                            {filteredCategories.map(cat => {
                                const available = getBucketAvailable(cat.id, plans, transactions, monthKey);
                                const isSelected = categoryId === cat.id;
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[styles.catCard, isSelected && styles.catCardSelected]}
                                        onPress={() => setCategoryId(cat.id)}
                                    >
                                        <Text style={[styles.catName, isSelected && styles.catNameSelected]}>{cat.name}</Text>
                                        <Text style={[styles.catAvailable, isSelected && styles.catAvailableSelected]}>
                                            {(available / 100).toLocaleString()} {currencySymbol}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={[styles.label, { marginTop: 24 }]}>Note</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Optional note..."
                            placeholderTextColor={Colors.textSecondary}
                            value={note}
                            onChangeText={setNote}
                        />

                        <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
                            <Text style={styles.primaryBtnText}>Save {type}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep(1)}>
                            <Text style={styles.secondaryBtnText}>Back</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, marginBottom: 24 },
    backBtn: { width: 40, marginLeft: -8 },
    headerTitle: { ...Typography.h3, flex: 1, textAlign: 'center', marginRight: 32 },
    typeSelector: { flexDirection: 'row', paddingHorizontal: 24, gap: 8, marginBottom: 32 },
    typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', borderWidth: 1, borderColor: Colors.glassBorder },
    typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    typeBtnText: { ...Typography.bodyMedium, color: Colors.textSecondary },
    typeBtnTextActive: { color: '#FFFFFF', fontWeight: '800' },
    content: { flex: 1, paddingHorizontal: 24 },
    step: { gap: 16 },
    label: { ...Typography.label, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
    amountContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginVertical: 12 },
    amountText: { ...Typography.h1, fontSize: 48, color: Colors.text },
    amountCurrency: { ...Typography.h3, color: Colors.textSecondary, marginBottom: 12, marginLeft: 8 },
    chipsScroll: { marginHorizontal: -24, paddingHorizontal: 24 },
    chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 10, borderWidth: 1, borderColor: Colors.glassBorder },
    chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    chipText: { ...Typography.bodyMedium, color: Colors.textSecondary },
    chipTextActive: { color: '#FFFFFF', fontWeight: '800' },
    primaryBtn: { backgroundColor: Colors.primary, padding: 20, borderRadius: 24, alignItems: 'center', marginTop: 32, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
    primaryBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    secondaryBtn: { padding: 16, alignItems: 'center' },
    secondaryBtnText: { ...Typography.bodyMedium, color: Colors.textSecondary },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    catCard: { width: '48%', padding: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: Colors.glassBorder },
    catCardSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    catName: { ...Typography.bodyBold, fontSize: 15 },
    catNameSelected: { color: '#FFFFFF' },
    catAvailable: { ...Typography.small, color: Colors.textSecondary, marginTop: 4 },
    catAvailableSelected: { color: 'rgba(255,255,255,0.8)' },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, fontSize: 16, color: Colors.text, borderWidth: 1, borderColor: Colors.glassBorder },
});
