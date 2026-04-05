import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useDataSelection } from '../../src/hooks/useData';
import { accountRepository } from '../../src/db/repositories/AccountRepository';
import { useExport } from '../../src/hooks/useExport';
import { useSettings } from '../../src/hooks/useSettings';
import { useBehavior } from '../../src/hooks/useBehavior';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
            Alert.alert('Success', 'Account created!');
        } catch (error) {
            Alert.alert('Error', 'Failed to create account.');
        }
    };

    const handleSelectCurrency = () => {
        Alert.alert(
            'Primary Currency',
            'Choose your primary currency for reports/calculations.',
            [
                { text: 'EUR (€)', onPress: () => updateSetting('primary_currency', 'EUR') },
                { text: 'USD ($)', onPress: () => updateSetting('primary_currency', 'USD') },
                { text: 'RUB (₽)', onPress: () => updateSetting('primary_currency', 'RUB') },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const handleSelectWeekStart = () => {
        Alert.alert(
            'Week Start',
            'When does your financial week begin?',
            [
                { text: 'Monday', onPress: () => updateSetting('week_starts_on', 'Monday') },
                { text: 'Sunday', onPress: () => updateSetting('week_starts_on', 'Sunday') },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    if (!isReady) return null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Settings</Text>

            {/* Accounts Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Accounts</Text>
                {accounts.map(acc => (
                    <View key={acc.id} style={styles.item}>
                        <Text style={styles.itemName}>{acc.name}</Text>
                        <Text style={styles.itemValue}>{(acc.opening_balance_cents / 100).toFixed(2)} €</Text>
                    </View>
                ))}

                <View style={styles.addForm}>
                    <Text style={styles.formTitle}>Add New Account</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Account Name (e.g. Bank, Cash)"
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Opening Balance (e.g. 1000.00)"
                        keyboardType="decimal-pad"
                        value={balance}
                        onChangeText={setBalance}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
                        <Text style={styles.addButtonText}>Add Account</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* App Preferences Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>
                <TouchableOpacity style={styles.item} onPress={handleSelectCurrency}>
                    <Text style={styles.itemName}>Primary Currency</Text>
                    <View style={styles.itemRight}>
                        <Text style={styles.itemValue}>{getSetting('primary_currency', 'EUR')}</Text>
                        <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.item} onPress={() => router.push('/settings/practices' as any)}>
                    <Text style={styles.itemName}>Practice Library</Text>
                    <View style={styles.itemRight}>
                        <Text style={styles.itemValue}>{definitions.length} items</Text>
                        <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Data Management Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data & Portability</Text>
                {exportLoading ? (
                    <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 20 }} />
                ) : (
                    <>
                        <TouchableOpacity style={styles.actionItem} onPress={exportJSON}>
                            <Ionicons name="cloud-download-outline" size={22} color="#007AFF" />
                            <Text style={styles.actionText}>Export JSON Backup</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => importJSON(refresh)}>
                            <Ionicons name="cloud-upload-outline" size={22} color="#5856D6" />
                            <Text style={[styles.actionText, { color: '#5856D6' }]}>Import JSON Backup</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={exportCSV}>
                            <Ionicons name="list-outline" size={22} color="#34C759" />
                            <Text style={[styles.actionText, { color: '#34C759' }]}>Export Transactions (CSV)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionItem, { borderBottomWidth: 0 }]} onPress={() => resetData(refresh)}>
                            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                            <Text style={[styles.actionText, { color: '#FF3B30' }]}>Reset All Data (Danger)</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>App Info</Text>
                <Text style={styles.infoText}>Moneywork MVP v1.1.0</Text>
                <Text style={styles.infoText}>Local-first Financial Behavior Tracker</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    content: { padding: 20, paddingTop: 60 },
    title: { fontSize: 34, fontWeight: 'bold', marginBottom: 24 },
    section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 24 },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', marginBottom: 12 },
    item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    itemName: { fontSize: 16 },
    itemValue: { fontSize: 16, color: '#8E8E93' },
    addForm: { marginTop: 20, gap: 12 },
    formTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
    input: { backgroundColor: '#F2F2F7', padding: 12, borderRadius: 8, fontSize: 16 },
    addButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    actionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    actionText: { fontSize: 16, color: '#007AFF', fontWeight: '500' },
    infoText: { color: '#C7C7CC', fontSize: 12, marginBottom: 4 },
});
