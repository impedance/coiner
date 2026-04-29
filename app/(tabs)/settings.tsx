import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useDataSelection } from '../../src/hooks/useData';
import { accountRepository } from '../../src/db/repositories/AccountRepository';
import { useExport } from '../../src/hooks/useExport';
import { useSettings } from '../../src/hooks/useSettings';
import { useBehavior } from '../../src/hooks/useBehavior';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Layout } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
    const { accounts, isReady, refresh } = useDataSelection();
    const { exportJSON, exportCSV, importJSON, resetData, loading: exportLoading } = useExport();
    const { getSetting, updateSetting } = useSettings();
    const { definitions } = useBehavior();
    const router = useRouter();
    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');

    const handleAddAccount = async () => {
        if (!name || !balance) {
            Alert.alert('Missing Info', 'Please provide a name and opening balance.');
            return;
        }

        try {
            await accountRepository.create({
                name,
                type: 'checking',
                currency: 'EUR',
                opening_balance_cents: Math.round(parseFloat(balance.replace(',', '.')) * 100),
            });
            setName('');
            setBalance('');
            await refresh();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Account created!');
        } catch (error) {
            Alert.alert('Error', 'Failed to create account.');
        }
    };

    const handleSelectCurrency = () => {
        Alert.alert(
            'Primary Currency',
            'Choose your primary currency.',
            [
                { text: 'EUR (€)', onPress: () => updateSetting('primary_currency', 'EUR') },
                { text: 'USD ($)', onPress: () => updateSetting('primary_currency', 'USD') },
                { text: 'RUB (₽)', onPress: () => updateSetting('primary_currency', 'RUB') },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    if (!isReady) return null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            {/* Accounts Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Accounts</Text>
                {accounts.map(acc => (
                    <GlassCard key={acc.id} style={styles.item}>
                        <Text style={styles.itemName}>{acc.name}</Text>
                        <Text style={styles.itemValue}>{(acc.opening_balance_cents / 100).toFixed(2)} €</Text>
                    </GlassCard>
                ))}

                <GlassCard style={styles.addForm}>
                    <Text style={styles.formTitle}>Add New Account</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name (e.g. Bank, Cash)"
                        placeholderTextColor={Colors.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Balance (e.g. 1000.00)"
                        placeholderTextColor={Colors.textSecondary}
                        keyboardType="decimal-pad"
                        value={balance}
                        onChangeText={setBalance}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
                        <Text style={styles.addButtonText}>Add Account</Text>
                    </TouchableOpacity>
                </GlassCard>
            </View>

            {/* Preferences Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>
                <GlassCard style={{ padding: 0 }}>
                    <TouchableOpacity style={styles.listItem} onPress={handleSelectCurrency}>
                        <Ionicons name="card-outline" size={20} color={Colors.primary} />
                        <Text style={styles.itemName}>Primary Currency</Text>
                        <Text style={styles.itemValueRight}>{getSetting('primary_currency', 'EUR')}</Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.border} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.listItem} 
                        onPress={() => {
                            Alert.alert(
                                'Default Account',
                                'Select an account to use as default for transactions.',
                                [
                                    ...accounts.map(acc => ({
                                        text: acc.name,
                                        onPress: () => updateSetting('default_account_id', acc.id)
                                    })),
                                    { text: 'None', onPress: () => updateSetting('default_account_id', '') },
                                    { text: 'Cancel', style: 'cancel' } as const
                                ]
                            );
                        }}
                    >
                        <Ionicons name="wallet-outline" size={20} color={Colors.income} />
                        <Text style={styles.itemName}>Default Account</Text>
                        <Text style={styles.itemValueRight}>
                            {accounts.find(a => a.id === getSetting('default_account_id', ''))?.name || 'Not Set'}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.border} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0 }]} onPress={() => router.push('/more/practices' as any)}>
                        <Ionicons name="book-outline" size={20} color={Colors.secondary} />
                        <Text style={styles.itemName}>Practice Library</Text>
                        <Text style={styles.itemValueRight}>{definitions.length} items</Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.border} />
                    </TouchableOpacity>
                </GlassCard>
            </View>

            {/* Advanced & Psychology Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Psychology & Growth</Text>
                <GlassCard style={{ padding: 0 }}>
                    <TouchableOpacity style={styles.listItem} onPress={() => router.push('/more/goals' as any)}>
                        <Ionicons name="trophy-outline" size={20} color={Colors.primary} />
                        <Text style={styles.itemName}>Financial Goals</Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.border} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.listItem} onPress={() => router.push('/more/behavior' as any)}>
                        <Ionicons name="fitness-outline" size={20} color={Colors.secondary} />
                        <Text style={styles.itemName}>Behavior Tracking</Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.border} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.listItem} onPress={() => router.push('/more/review' as any)}>
                        <Ionicons name="checkmark-circle-outline" size={20} color={Colors.income} />
                        <Text style={styles.itemName}>Weekly Review</Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.border} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0 }]} onPress={() => router.push('/more/money-steps' as any)}>
                        <Ionicons name="list-outline" size={20} color={Colors.reserve} />
                        <Text style={styles.itemName}>Money Steps</Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.border} />
                    </TouchableOpacity>
                </GlassCard>
            </View>

            {/* Data Management Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data & Portability</Text>
                <GlassCard style={{ padding: 0 }}>
                    {exportLoading ? (
                        <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 32 }} />
                    ) : (
                        <>
                            <TouchableOpacity style={styles.actionItem} onPress={exportJSON}>
                                <Ionicons name="cloud-download-outline" size={20} color={Colors.primary} />
                                <Text style={styles.actionText}>Export JSON Backup</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionItem} onPress={() => importJSON(refresh)}>
                                <Ionicons name="cloud-upload-outline" size={20} color={Colors.secondary} />
                                <Text style={[styles.actionText, { color: Colors.secondary }]}>Import JSON Backup</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionItem} onPress={exportCSV}>
                                <Ionicons name="list-outline" size={20} color={Colors.income} />
                                <Text style={[styles.actionText, { color: Colors.income }]}>Export CSV</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionItem, { borderBottomWidth: 0 }]} onPress={() => resetData(refresh)}>
                                <Ionicons name="trash-outline" size={20} color={Colors.expense} />
                                <Text style={[styles.actionText, { color: Colors.expense }]}>Reset All Data</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </GlassCard>
            </View>

            <View style={[styles.section, { marginBottom: 60 }]}>
                <Text style={styles.sectionTitle}>App Info</Text>
                <Text style={styles.infoText}>Coiner MVP v2.0.0</Text>
                <Text style={styles.infoText}>Behavioral Financial Guide</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { 
        padding: Layout.PADDING, 
        paddingTop: 60,
        width: '100%',
        maxWidth: Layout.MAX_WIDTH,
        alignSelf: 'center',
    },
    header: { marginBottom: 24 },
    title: { ...Typography.h1 },
    section: { marginBottom: 32 },
    sectionTitle: { ...Typography.label, marginBottom: 12 },
    item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginBottom: 8 },
    itemName: { ...Typography.bodyMedium, flex: 1, marginLeft: 12 },
    itemValue: { ...Typography.bodyBold },
    itemValueRight: { ...Typography.body, color: Colors.textSecondary, marginRight: 8 },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    addForm: { marginTop: 12, padding: 20, gap: 12 },
    formTitle: { ...Typography.h3, marginBottom: 8 },
    input: { backgroundColor: 'rgba(0,0,0,0.03)', padding: 14, borderRadius: 16, fontSize: 16, color: Colors.text, borderWidth: 1, borderColor: Colors.glassBorder },
    addButton: { backgroundColor: Colors.primary, padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
    addButtonText: { ...Typography.bodyBold, color: '#FFFFFF' },
    actionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    actionText: { ...Typography.bodyMedium, color: Colors.primary },
    infoText: { ...Typography.small, color: Colors.textSecondary, marginBottom: 4 },
});
