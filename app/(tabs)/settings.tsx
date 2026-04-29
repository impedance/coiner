import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
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
    const [isAddingAccount, setIsAddingAccount] = useState(false);
    const [showAccountSelector, setShowAccountSelector] = useState(false);
    const [showCurrencySelector, setShowCurrencySelector] = useState(false);

    const handleAddAccount = async () => {
        if (!name || !balance) {
            Alert.alert('Missing Info', 'Please provide a name and opening balance.');
            return;
        }

        try {
            await accountRepository.create({
                name,
                type: 'checking',
                currency: getSetting('primary_currency', 'RUB'),
                opening_balance_cents: Math.round(parseFloat(balance.replace(',', '.')) * 100),
            });
            setName('');
            setBalance('');
            setIsAddingAccount(false);
            await refresh();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            Alert.alert('Error', 'Failed to create account.');
        }
    };

    if (!isReady) return null;

    const defaultAccountId = getSetting('default_account_id', '');
    const defaultAccount = accounts.find(a => a.id === defaultAccountId);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            {/* Accounts Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Accounts</Text>
                    <TouchableOpacity onPress={() => setIsAddingAccount(true)}>
                        <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
                
                {accounts.length === 0 ? (
                    <GlassCard style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No accounts yet. Add one to start tracking.</Text>
                    </GlassCard>
                ) : (
                    accounts.map(acc => (
                        <GlassCard key={acc.id} style={styles.item}>
                            <View style={styles.itemIcon}>
                                <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.itemMain}>
                                <Text style={styles.itemName}>{acc.name}</Text>
                                <Text style={styles.itemSub}>{acc.currency}</Text>
                            </View>
                            <Text style={styles.itemValue}>
                                {(acc.opening_balance_cents / 100).toLocaleString()} {acc.currency === 'RUB' ? '₽' : acc.currency}
                            </Text>
                        </GlassCard>
                    ))
                )}

                {isAddingAccount && (
                    <GlassCard style={styles.addForm}>
                        <View style={styles.formHeader}>
                            <Text style={styles.formTitle}>New Account</Text>
                            <TouchableOpacity onPress={() => setIsAddingAccount(false)}>
                                <Ionicons name="close" size={20} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Name (e.g. Bank, Cash)"
                            placeholderTextColor={Colors.textSecondary}
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Opening Balance"
                            placeholderTextColor={Colors.textSecondary}
                            keyboardType="decimal-pad"
                            value={balance}
                            onChangeText={setBalance}
                        />
                        <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
                            <Text style={styles.addButtonText}>Create Account</Text>
                        </TouchableOpacity>
                    </GlassCard>
                )}
            </View>

            {/* Preferences Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>
                <GlassCard style={{ padding: 0 }}>
                    <TouchableOpacity style={styles.listItem} onPress={() => setShowCurrencySelector(true)}>
                        <View style={[styles.listIcon, { backgroundColor: 'hsla(210, 100%, 50%, 0.1)' }]}>
                            <Ionicons name="card-outline" size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.listName}>Primary Currency</Text>
                        <Text style={styles.listValue}>{getSetting('primary_currency', 'RUB')}</Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.border} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.listItem} 
                        onPress={() => setShowAccountSelector(true)}
                    >
                        <View style={[styles.listIcon, { backgroundColor: 'hsla(142, 76%, 36%, 0.1)' }]}>
                            <Ionicons name="wallet-outline" size={20} color={Colors.income} />
                        </View>
                        <Text style={styles.listName}>Default Account</Text>
                        <Text style={styles.listValue}>
                            {defaultAccount?.name || 'Not Set'}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.border} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0 }]} onPress={() => router.push('/more/practices' as any)}>
                        <View style={[styles.listIcon, { backgroundColor: 'hsla(280, 100%, 70%, 0.1)' }]}>
                            <Ionicons name="book-outline" size={20} color={Colors.secondary} />
                        </View>
                        <Text style={styles.listName}>Practice Library</Text>
                        <Text style={styles.listValue}>{definitions.length} items</Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.border} />
                    </TouchableOpacity>
                </GlassCard>
            </View>

            {/* Data Management Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data & Backup</Text>
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
                            <TouchableOpacity style={[styles.actionItem, { borderBottomWidth: 0 }]} onPress={() => resetData(refresh)}>
                                <Ionicons name="trash-outline" size={20} color={Colors.expense} />
                                <Text style={[styles.actionText, { color: Colors.expense }]}>Reset All Data</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </GlassCard>
            </View>

            {/* Account Selector Modal */}
            <Modal visible={showAccountSelector} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowAccountSelector(false)} />
                    <GlassCard style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Default Account</Text>
                        <ScrollView style={styles.modalScroll}>
                            {accounts.map(acc => (
                                <TouchableOpacity 
                                    key={acc.id} 
                                    style={[styles.modalItem, defaultAccountId === acc.id && styles.modalItemActive]}
                                    onPress={() => {
                                        updateSetting('default_account_id', acc.id);
                                        setShowAccountSelector(false);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                >
                                    <Text style={[styles.modalItemText, defaultAccountId === acc.id && styles.modalItemTextActive]}>
                                        {acc.name}
                                    </Text>
                                    {defaultAccountId === acc.id && <Ionicons name="checkmark" size={20} color="#FFF" />}
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity 
                                style={[styles.modalItem, !defaultAccountId && styles.modalItemActive]}
                                onPress={() => {
                                    updateSetting('default_account_id', '');
                                    setShowAccountSelector(false);
                                }}
                            >
                                <Text style={[styles.modalItemText, !defaultAccountId && styles.modalItemTextActive]}>None</Text>
                            </TouchableOpacity>
                        </ScrollView>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setShowAccountSelector(false)}>
                            <Text style={styles.modalCloseText}>Cancel</Text>
                        </TouchableOpacity>
                    </GlassCard>
                </View>
            </Modal>

            {/* Currency Selector Modal */}
            <Modal visible={showCurrencySelector} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowCurrencySelector(false)} />
                    <GlassCard style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Primary Currency</Text>
                        {['RUB', 'EUR', 'USD'].map(curr => (
                            <TouchableOpacity 
                                key={curr} 
                                style={[styles.modalItem, getSetting('primary_currency', 'RUB') === curr && styles.modalItemActive]}
                                onPress={() => {
                                    updateSetting('primary_currency', curr);
                                    setShowCurrencySelector(false);
                                }}
                            >
                                <Text style={[styles.modalItemText, getSetting('primary_currency', 'RUB') === curr && styles.modalItemTextActive]}>
                                    {curr}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </GlassCard>
                </View>
            </Modal>

            <View style={[styles.section, { marginBottom: 60 }]}>
                <Text style={styles.infoText}>Coiner v2.1.0</Text>
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
    header: { marginBottom: 32 },
    title: { ...Typography.h1, fontSize: 36 },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { ...Typography.label, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
    item: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, borderRadius: 20 },
    itemIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'hsla(210, 100%, 50%, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    itemMain: { flex: 1 },
    itemName: { ...Typography.bodyBold, fontSize: 17 },
    itemSub: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
    itemValue: { ...Typography.bodyBold, color: Colors.text },
    
    emptyCard: { padding: 32, alignItems: 'center', borderRadius: 24, borderStyle: 'dashed' },
    emptyText: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center' },

    listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    listIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    listName: { ...Typography.bodyMedium, flex: 1 },
    listValue: { ...Typography.body, color: Colors.textSecondary, marginRight: 8 },

    addForm: { marginTop: 8, padding: 20, gap: 12, borderRadius: 24, borderWidth: 1, borderColor: Colors.primary },
    formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    formTitle: { ...Typography.h3 },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, fontSize: 16, color: Colors.text, borderWidth: 1, borderColor: Colors.glassBorder },
    addButton: { backgroundColor: Colors.primary, padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
    addButtonText: { ...Typography.bodyBold, color: '#FFFFFF' },

    actionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    actionText: { ...Typography.bodyMedium, color: Colors.primary },
    infoText: { ...Typography.small, color: Colors.textSecondary, textAlign: 'center', marginBottom: 4 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject },
    modalContent: { width: '85%', maxWidth: 340, padding: 24, borderRadius: 28 },
    modalTitle: { ...Typography.h3, marginBottom: 20, textAlign: 'center' },
    modalScroll: { maxHeight: 300 },
    modalItem: { padding: 16, borderRadius: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
    modalItemActive: { backgroundColor: Colors.primary },
    modalItemText: { ...Typography.bodyMedium, color: Colors.text },
    modalItemTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
    modalClose: { marginTop: 16, padding: 12, alignItems: 'center' },
    modalCloseText: { ...Typography.bodyMedium, color: Colors.textSecondary },
});
