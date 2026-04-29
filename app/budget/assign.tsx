import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { usePlanning } from '../../src/hooks/usePlanning';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';

export default function AssignScreen() {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const { unassignedMoney, plans, categories, categoryGroups, assignMoney, loading } = usePlanning(monthKey);

    // Local state for pending assignments
    const [assignments, setAssignments] = useState<Record<string, string>>({});

    const currentReadyToAssign = useMemo(() => {
        let totalAssignedInScreen = 0;
        Object.entries(assignments).forEach(([catId, val]) => {
            const amount = parseInt(val) || 0;
            const existingPlan = plans.find(p => p.category_id === catId);
            const existingAssigned = existingPlan ? existingPlan.assigned_cents / 100 : 0;
            totalAssignedInScreen += (amount - existingAssigned);
        });
        return unassignedMoney - (totalAssignedInScreen * 100);
    }, [unassignedMoney, assignments, plans]);

    const handleSave = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        for (const [categoryId, amountStr] of Object.entries(assignments)) {
            const amountCents = (parseInt(amountStr) || 0) * 100;
            await assignMoney(categoryId, amountCents);
        }
        router.back();
    };

    const formatCents = (cents: number) =>
        (cents / 100).toLocaleString('ru-RU', { minimumFractionDigits: 0 }) + ' ₽';

    if (loading) return null;

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Assign Money</Text>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Done</Text>
                </TouchableOpacity>
            </View>

            <GlassCard style={styles.summaryCard} tint="dark" intensity={20}>
                <Text style={styles.summaryLabel}>Remaining to Assign</Text>
                <Text style={[
                    styles.summaryAmount, 
                    { color: currentReadyToAssign < 0 ? Colors.expense : Colors.income }
                ]}>
                    {formatCents(currentReadyToAssign)}
                </Text>
            </GlassCard>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                {categoryGroups.map(group => (
                    <View key={group.id} style={styles.groupSection}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        {categories.filter(c => c.group_id === group.id).map(cat => {
                            const plan = plans.find(p => p.category_id === cat.id);
                            const currentVal = assignments[cat.id] ?? (plan ? (plan.assigned_cents / 100).toString() : '0');

                            return (
                                <View key={cat.id} style={styles.row}>
                                    <Text style={styles.catName}>{cat.name}</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            value={currentVal}
                                            onChangeText={(val) => setAssignments(prev => ({ ...prev, [cat.id]: val }))}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor={Colors.textSecondary}
                                        />
                                        <Text style={styles.currency}>₽</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
    },
    title: {
        ...Typography.h3,
        color: Colors.text,
    },
    saveButton: {
        width: 60,
        alignItems: 'flex-end',
    },
    saveButtonText: {
        ...Typography.bodyBold,
        color: Colors.primary,
    },
    summaryCard: {
        margin: 20,
        padding: 20,
        alignItems: 'center',
        borderRadius: 20,
    },
    summaryLabel: {
        ...Typography.small,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    summaryAmount: {
        ...Typography.h1,
        fontSize: 32,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    groupSection: {
        marginBottom: 24,
    },
    groupName: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginBottom: 12,
        fontSize: 12,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    catName: {
        ...Typography.bodyMedium,
        color: Colors.text,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    input: {
        ...Typography.bodyBold,
        color: Colors.text,
        textAlign: 'right',
        minWidth: 60,
        padding: 0,
    },
    currency: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
});
