import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useDataSelection } from '../../src/hooks/useData';
import { accountRepository } from '../../src/db/repositories/AccountRepository';

export default function SettingsScreen() {
    const { accounts, isReady, refresh } = useDataSelection();
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

    if (!isReady) return null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Settings</Text>

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

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>App Info</Text>
                <Text style={styles.infoText}>Moneywork MVP v1.0.0</Text>
                <Text style={styles.infoText}>Local-first Financial Behavior Tracker</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
        color: '#000',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    itemName: {
        fontSize: 16,
    },
    itemValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E8E93',
    },
    addForm: {
        marginTop: 20,
        gap: 12,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    input: {
        backgroundColor: '#F2F2F7',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#007AFF',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    infoText: {
        color: '#8E8E93',
        marginBottom: 4,
    },
});
