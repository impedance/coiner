import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { usePlanning } from '../../src/hooks/usePlanning';
import { useDataSelection } from '../../src/hooks/useData';
import { MonthlyBucketPlan, Category } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';

export default function PlanScreen() {
    const monthKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    const { plans, categories, categoryGroups, unassignedMoney, loading, assignMoney, updatePlanned } = usePlanning(monthKey);
    const { transactions } = useDataSelection();

    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
    const [editAmount, setEditAmount] = React.useState('');
    const [editType, setEditType] = React.useState<'planned' | 'assigned'>('planned');

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const getSpentForCategory = (categoryId: string) => {
        return transactions
            .filter(tx => tx.category_id === categoryId && tx.happened_at.startsWith(monthKey))
            .reduce((sum, tx) => sum + tx.amount_cents, 0);
    };

    const handleSave = async () => {
        if (!selectedCategory) return;
        const amountCents = Math.round(parseFloat(editAmount) * 100);
        if (isNaN(amountCents)) return;

        if (editType === 'planned') {
            await updatePlanned(selectedCategory.id, amountCents);
        } else {
            await assignMoney(selectedCategory.id, amountCents);
        }
        setSelectedCategory(null);
        setEditAmount('');
    };

    const categoriesByGroup = useMemo(() => {
        const grouped: Record<string, Category[]> = {};
        categories.forEach(cat => {
            const groupId = cat.group_id || 'unprocessed';
            if (!grouped[groupId]) grouped[groupId] = [];
            grouped[groupId].push(cat);
        });
        return grouped;
    }, [categories]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.monthLabel}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                <View style={styles.unassignedCard}>
                    <Text style={styles.unassignedLabel}>To be assigned</Text>
                    <Text style={[styles.unassignedAmount, { color: unassignedMoney < 0 ? '#FF3B30' : '#34C759' }]}>
                        {(unassignedMoney / 100).toFixed(2)} €
                    </Text>
                </View>
            </View>

            <ScrollView style={styles.bucketList}>
                {categoryGroups.map(group => {
                    const groupCats = categoriesByGroup[group.id] || [];
                    if (groupCats.length === 0) return null;

                    const groupPlanned = groupCats.reduce((sum, cat) => {
                        const plan = plans.find(p => p.category_id === cat.id);
                        return sum + (plan?.planned_cents || 0);
                    }, 0);

                    const groupSpent = groupCats.reduce((sum, cat) => sum + getSpentForCategory(cat.id), 0);
                    const groupAssigned = groupCats.reduce((sum, cat) => {
                        const plan = plans.find(p => p.category_id === cat.id);
                        return sum + (plan?.assigned_cents || 0);
                    }, 0);
                    const groupAvailable = groupAssigned - groupSpent;

                    return (
                        <View key={group.id} style={styles.groupContainer}>
                            <View style={styles.groupHeader}>
                                <Text style={styles.groupName}>{group.name}</Text>
                                <View style={styles.groupTotals}>
                                    <View style={styles.groupTotalItem}>
                                        <Text style={styles.groupTotalLabel}>Planned</Text>
                                        <Text style={styles.groupTotalValue}>{(groupPlanned / 100).toFixed(0)}€</Text>
                                    </View>
                                    <View style={[styles.groupTotalItem, { alignItems: 'flex-end' }]}>
                                        <Text style={styles.groupTotalLabel}>Available</Text>
                                        <Text style={[styles.groupTotalValue, { color: groupAvailable < 0 ? '#FF3B30' : '#007AFF' }]}>
                                            {(groupAvailable / 100).toFixed(0)}€
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {groupCats.map(cat => {
                                const plan = plans.find(p => p.category_id === cat.id);
                                const spent = getSpentForCategory(cat.id);
                                const assigned = plan?.assigned_cents || 0;
                                const available = assigned - spent;
                                const isSystem = cat.is_system;

                                return (
                                    <View key={cat.id} style={[styles.bucketItem, isSystem && styles.systemBucket]}>
                                        <View style={styles.bucketHeader}>
                                            <Text style={[styles.bucketName, isSystem && styles.systemBucketName]}>
                                                {cat.name}
                                                {isSystem && <Text style={styles.systemIcon}> 🛡️</Text>}
                                            </Text>
                                            <View style={styles.bucketActions}>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setSelectedCategory(cat);
                                                        setEditType('planned');
                                                        setEditAmount(((plan?.planned_cents || 0) / 100).toString());
                                                    }}
                                                >
                                                    <Ionicons name="settings-outline" size={20} color={isSystem ? "#007AFF" : "#8E8E93"} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <View style={styles.bucketStats}>
                                            <View style={styles.stat}>
                                                <Text style={styles.statLabel}>Planned</Text>
                                                <Text style={styles.statValue}>{((plan?.planned_cents || 0) / 100).toFixed(0)}€</Text>
                                            </View>
                                            <View style={styles.stat}>
                                                <Text style={styles.statLabel}>Spent</Text>
                                                <Text style={styles.statValue}>{(spent / 100).toFixed(0)}€</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={[styles.stat, styles.availableStat]}
                                                onPress={() => {
                                                    setSelectedCategory(cat);
                                                    setEditType('assigned');
                                                    setEditAmount((assigned / 100).toString());
                                                }}
                                            >
                                                <Text style={styles.statLabel}>Available</Text>
                                                <Text style={[styles.statValue, { color: available < 0 ? '#FF3B30' : '#34C759' }]}>
                                                    {(available / 100).toFixed(0)}€
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    );
                })}
            </ScrollView>

            <Modal visible={!!selectedCategory} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editType === 'planned' ? 'Set Planned Amount' : 'Assign Money'} for {selectedCategory?.name}
                        </Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={editAmount}
                            onChangeText={setEditAmount}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedCategory(null)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    monthLabel: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
    unassignedCard: { backgroundColor: '#F2F2F7', padding: 16, borderRadius: 12, alignItems: 'center' },
    unassignedLabel: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
    unassignedAmount: { fontSize: 24, fontWeight: 'bold' },
    bucketList: { padding: 16 },
    bucketItem: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    bucketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    bucketName: { fontSize: 18, fontWeight: '600' },
    bucketActions: { flexDirection: 'row', gap: 12 },
    bucketStats: { flexDirection: 'row', justifyContent: 'space-between' },
    stat: { flex: 1, alignItems: 'flex-start' },
    availableStat: { alignItems: 'flex-end' },
    statLabel: { fontSize: 12, color: '#8E8E93', marginBottom: 4 },
    statValue: { fontSize: 16, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
    modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 20 },
    input: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 16, fontSize: 20, marginBottom: 20 },
    modalButtons: { flexDirection: 'row', gap: 12 },
    cancelButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#F2F2F7' },
    cancelButtonText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
    saveButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#007AFF' },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    groupContainer: { marginBottom: 24 },
    groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12, paddingHorizontal: 4 },
    groupName: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
    groupTotals: { flexDirection: 'row', gap: 16 },
    groupTotalItem: { alignItems: 'flex-start' },
    groupTotalLabel: { fontSize: 10, color: '#8E8E93', textTransform: 'uppercase', marginBottom: 2 },
    groupTotalValue: { fontSize: 14, fontWeight: '600', color: '#3A3A3C' },
    systemBucket: { borderLeftWidth: 4, borderLeftColor: '#007AFF', backgroundColor: '#F0F7FF' },
    systemBucketName: { color: '#004085' },
    systemIcon: { fontSize: 14 },
});
