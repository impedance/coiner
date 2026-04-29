import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { usePlanning } from '../../src/hooks/usePlanning';
import { useSettings } from '../../src/hooks/useSettings';
import { Colors, Typography, Layout } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { AnimatedProgressBar } from '../../src/components/AnimatedProgressBar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function IncomeWizardScreen() {
    const { amountCents: amountCentsParam } = useLocalSearchParams<{ amountCents: string }>();
    const totalAmount = parseInt(amountCentsParam || '0', 10);
    
    const { getSetting } = useSettings();
    const primaryCurrency = getSetting('primary_currency', 'RUB');
    const currencySymbol = primaryCurrency === 'RUB' ? '₽' : (primaryCurrency === 'USD' ? '$' : '€');

    const monthKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    const { plans, categories, categoryGroups, loading, assignMoney } = usePlanning(monthKey);
    
    const [assignments, setAssignments] = useState<Record<string, number>>({});
    const [autoReserve, setAutoReserve] = useState(true);

    const reserveCategory = useMemo(() => 
        categories.find(c => c.bucket_type === 'reserve'),
    [categories]);

    // Initial setup: 10% to reserve
    useEffect(() => {
        if (reserveCategory && autoReserve && totalAmount > 0) {
            const tenPercent = Math.round(totalAmount * 0.1);
            setAssignments(prev => ({
                ...prev,
                [reserveCategory.id]: tenPercent
            }));
        }
    }, [reserveCategory, autoReserve, totalAmount]);

    const distributedAmount = useMemo(() => {
        return Object.values(assignments).reduce((sum, val) => sum + val, 0);
    }, [assignments]);

    const remainingAmount = totalAmount - distributedAmount;
    const progress = totalAmount > 0 ? distributedAmount / totalAmount : 0;

    const handleAssign = (categoryId: string, value: string) => {
        const amount = Math.round(parseFloat(value.replace(',', '.')) * 100) || 0;
        setAssignments(prev => ({
            ...prev,
            [categoryId]: amount
        }));
    };

    const handleSave = async () => {
        if (remainingAmount !== 0) {
            Alert.alert(
                'Remaining Balance',
                `You still have ${(remainingAmount / 100).toFixed(2)} ${currencySymbol} left to distribute. Continue anyway?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Save', onPress: saveAndExit }
                ]
            );
        } else {
            await saveAndExit();
        }
    };

    const saveAndExit = async () => {
        try {
            for (const [catId, amount] of Object.entries(assignments)) {
                const existingPlan = plans.find(p => p.category_id === catId);
                const currentAssigned = existingPlan?.assigned_cents || 0;
                await assignMoney(catId, currentAssigned + amount);
            }
            
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/(tabs)/plan');
        } catch (error) {
            Alert.alert('Error', 'Failed to save distribution.');
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Distribution Wizard</Text>
                <Text style={styles.subtitle}>Putting your money to work</Text>
            </View>

            <View style={styles.statusBar}>
                <GlassCard style={styles.statusCard}>
                    <View style={styles.statusInfo}>
                        <View>
                            <Text style={styles.statusLabel}>Income</Text>
                            <Text style={styles.statusValue}>{(totalAmount / 100).toLocaleString()} {currencySymbol}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.statusLabel}>Remaining</Text>
                            <Text style={[styles.statusValue, remainingAmount === 0 && { color: Colors.income }]}>
                                {(remainingAmount / 100).toLocaleString()} {currencySymbol}
                            </Text>
                        </View>
                    </View>
                    <AnimatedProgressBar 
                        progress={progress} 
                        color={remainingAmount < 0 ? Colors.expense : Colors.income}
                        style={{ marginTop: 12 }}
                    />
                </GlassCard>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {categoryGroups.map(group => {
                    const groupCats = categories.filter(c => c.group_id === group.id);
                    if (groupCats.length === 0) return null;

                    return (
                        <View key={group.id} style={styles.group}>
                            <Text style={styles.groupTitle}>{group.name}</Text>
                            {groupCats.map(cat => {
                                const isReserve = cat.bucket_type === 'reserve';
                                return (
                                    <GlassCard key={cat.id} style={styles.catItem}>
                                        <View style={styles.catInfo}>
                                            <Text style={styles.catName}>{cat.name}</Text>
                                            {isReserve && (
                                                <TouchableOpacity 
                                                    onPress={() => setAutoReserve(!autoReserve)}
                                                    style={styles.badge}
                                                >
                                                    <Text style={styles.badgeText}>10% Auto</Text>
                                                    <Ionicons 
                                                        name={autoReserve ? "checkbox" : "square-outline"} 
                                                        size={14} 
                                                        color={Colors.primary} 
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                keyboardType="decimal-pad"
                                                placeholder="0"
                                                placeholderTextColor={Colors.textSecondary}
                                                value={assignments[cat.id] ? (assignments[cat.id] / 100).toString() : ''}
                                                onChangeText={(val) => handleAssign(cat.id, val)}
                                            />
                                            <Text style={styles.currency}>{currencySymbol}</Text>
                                        </View>
                                    </GlassCard>
                                );
                            })}
                        </View>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Finish Distribution</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    header: { padding: 24, paddingTop: 60 },
    backButton: { marginBottom: 16, marginLeft: -8 },
    title: { ...Typography.h1 },
    subtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: 4 },
    statusBar: { paddingHorizontal: 20, marginBottom: 24 },
    statusCard: { padding: 20 },
    statusInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    statusLabel: { ...Typography.label, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
    statusValue: { ...Typography.h2 },
    content: { flex: 1, paddingHorizontal: 20 },
    group: { marginBottom: 32 },
    groupTitle: { ...Typography.label, color: Colors.primary, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
    catItem: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 16, 
        marginBottom: 12,
        borderRadius: 20
    },
    catInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    catName: { ...Typography.bodyBold },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.glassBorder },
    input: { paddingVertical: 10, fontSize: 18, fontWeight: '700', minWidth: 80, textAlign: 'right', color: Colors.text },
    currency: { marginLeft: 6, color: Colors.textSecondary, fontSize: 14 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 40 },
    saveButton: { backgroundColor: Colors.primary, padding: 20, borderRadius: 20, alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
    saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'hsla(210, 100%, 50%, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    badgeText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
});
