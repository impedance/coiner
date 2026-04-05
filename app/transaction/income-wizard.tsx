import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { usePlanning } from '../../src/hooks/usePlanning';
import { Colors } from '../../src/theme/colors';
import { GlassCard } from '../../src/components/GlassCard';
import { AnimatedProgressBar } from '../../src/components/AnimatedProgressBar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function IncomeWizardScreen() {
    const { amountCents: amountCentsParam } = useLocalSearchParams<{ amountCents: string }>();
    const totalAmount = parseInt(amountCentsParam || '0', 10);
    
    const monthKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    const { plans, categories, categoryGroups, loading, assignMoney, refresh } = usePlanning(monthKey);
    
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
                `You still have ${(remainingAmount / 100).toFixed(2)} € left to distribute. Continue anyway?`,
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
            // We need to add the new assignments to existing ones
            for (const [catId, amount] of Object.entries(assignments)) {
                const existingPlan = plans.find(p => p.category_id === catId);
                const currentAssigned = existingPlan?.assigned_cents || 0;
                await assignMoney(catId, currentAssigned + amount);
            }
            
            if (Platform.OS !== 'web') {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            
            Alert.alert('Success', 'Income has been distributed to your buckets.', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/plan') }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to save distribution.');
        }
    };

    if (loading) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Distribution Wizard</Text>
                <Text style={styles.subtitle}>Let's put your money to work</Text>
            </View>

            <View style={styles.statusBar}>
                <GlassCard style={styles.statusCard}>
                    <View style={styles.statusInfo}>
                        <View>
                            <Text style={styles.statusLabel}>Total Income</Text>
                            <Text style={styles.statusValue}>{(totalAmount / 100).toFixed(2)} €</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.statusLabel}>Remaining</Text>
                            <Text style={[styles.statusValue, remainingAmount === 0 && { color: Colors.income }]}>
                                {(remainingAmount / 100).toFixed(2)} €
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

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
                {categoryGroups.map(group => {
                    const groupCats = categories.filter(c => c.group_id === group.id);
                    if (groupCats.length === 0) return null;

                    return (
                        <View key={group.id} style={styles.group}>
                            <Text style={styles.groupTitle}>{group.name}</Text>
                            {groupCats.map(cat => {
                                const isReserve = cat.bucket_type === 'reserve';
                                return (
                                    <View key={cat.id} style={styles.catItem}>
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
                                                placeholder="0.00"
                                                value={assignments[cat.id] ? (assignments[cat.id] / 100).toString() : ''}
                                                onChangeText={(val) => handleAssign(cat.id, val)}
                                            />
                                            <Text style={styles.currency}>€</Text>
                                        </View>
                                    </View>
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
    header: { padding: 24, paddingTop: 60 },
    title: { fontSize: 28, fontWeight: '800', color: Colors.text },
    subtitle: { fontSize: 16, color: Colors.textSecondary, marginTop: 4 },
    statusBar: { paddingHorizontal: 20, marginBottom: 20 },
    statusCard: { padding: 16 },
    statusInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    statusLabel: { fontSize: 12, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    statusValue: { fontSize: 20, fontWeight: '700', color: Colors.text },
    content: { flex: 1, paddingHorizontal: 20 },
    group: { marginBottom: 24 },
    groupTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12, opacity: 0.8 },
    catItem: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#FFF', 
        padding: 12, 
        borderRadius: 16, 
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)'
    },
    catInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    catName: { fontSize: 16, fontWeight: '500' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 8, paddingHorizontal: 12 },
    input: { paddingVertical: 8, fontSize: 16, fontWeight: '600', minWidth: 60, textAlign: 'right' },
    currency: { marginLeft: 4, color: Colors.textSecondary, fontSize: 14 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: Colors.background },
    saveButton: { backgroundColor: Colors.primary, padding: 18, borderRadius: 18, alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0, 122, 255, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
});
