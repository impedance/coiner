import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useGoals } from '../../src/hooks/useGoals';
import { useArtifacts } from '../../src/hooks/useArtifacts';
import { Goal, Artifact } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

export default function GoalsScreen() {
    const { goals, loading: goalsLoading, createGoal, contribute } = useGoals();
    const { artifacts, addArtifact, loading: artifactsLoading } = useArtifacts();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'create' | 'contribute' | 'artifact'>('create');
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [amount, setAmount] = useState('');
    const [artifactTitle, setArtifactTitle] = useState('');

    if (goalsLoading || artifactsLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const handleCreate = async () => {
        await createGoal({
            name,
            target_cents: Math.round(parseFloat(target) * 100),
            goal_type: 'custom',
            status: 'active',
        });
        setModalVisible(false);
        resetForm();
    };

    const handleContribute = async () => {
        if (!selectedGoal) return;
        await contribute(selectedGoal.id, Math.round(parseFloat(amount) * 100));
        setModalVisible(false);
        resetForm();
    };

    const handleAddArtifact = async () => {
        if (!selectedGoal || !artifactTitle) return;
        await addArtifact({
            goal_id: selectedGoal.id,
            title: artifactTitle,
            unlock_rule_type: 'manual',
        });
        setModalVisible(false);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setTarget('');
        setAmount('');
        setArtifactTitle('');
        setSelectedGoal(null);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Goals</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setModalType('create');
                        setModalVisible(true);
                    }}
                >
                    <Ionicons name="add" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.list}>
                {goals.length === 0 ? (
                    <Text style={styles.emptyText}>No goals yet. Create one to start saving!</Text>
                ) : (
                    goals.map(goal => {
                        const progress = goal.target_cents > 0 ? (goal.current_cents / goal.target_cents) : 0;
                        return (
                            <View key={goal.id} style={styles.goalCard}>
                                <View style={styles.goalHeader}>
                                    <Text style={styles.goalName}>{goal.name}</Text>
                                    <View style={styles.goalTypeTag}>
                                        <Text style={styles.goalTypeText}>{goal.goal_type}</Text>
                                    </View>
                                </View>

                                <View style={styles.progressContainer}>
                                    <View style={[styles.progressBar, { width: `${Math.min(1, progress) * 100}%` }]} />
                                </View>

                                {/* Artifacts / Emotional Anchors */}
                                <View style={styles.artifactsSection}>
                                    <View style={styles.artifactsHeader}>
                                        <Text style={styles.artifactsTitle}>Emotional Anchors</Text>
                                        <TouchableOpacity 
                                            onPress={() => {
                                                setSelectedGoal(goal);
                                                setModalType('artifact');
                                                setModalVisible(true);
                                            }}
                                        >
                                            <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                                        </TouchableOpacity>
                                    </View>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.artifactsList}>
                                        {artifacts.filter(a => a.goal_id === goal.id).map(artifact => (
                                            <View key={artifact.id} style={styles.artifactBadge}>
                                                <Ionicons name="image-outline" size={16} color="#8E8E93" />
                                                <Text style={styles.artifactBadgeText}>{artifact.title}</Text>
                                            </View>
                                        ))}
                                        {artifacts.filter(a => a.goal_id === goal.id).length === 0 && (
                                            <Text style={styles.emptyArtifacts}>Add a photo or note to stay motivated!</Text>
                                        )}
                                    </ScrollView>
                                </View>

                                <View style={styles.goalFooter}>
                                    <Text style={styles.progressText}>
                                        {(goal.current_cents / 100).toFixed(0)}€ of {(goal.target_cents / 100).toFixed(0)}€
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.contributeButton}
                                        onPress={() => {
                                            setSelectedGoal(goal);
                                            setModalType('contribute');
                                            setModalVisible(true);
                                        }}
                                    >
                                        <Text style={styles.contributeButtonText}>Contribute</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {modalType === 'create' ? 'New Goal' : 
                             modalType === 'contribute' ? `Contribute to ${selectedGoal?.name}` :
                             `New Anchor for ${selectedGoal?.name}`}
                        </Text>

                        {modalType === 'create' && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Goal Name"
                                    value={name}
                                    onChangeText={setName}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Target Amount (€)"
                                    keyboardType="numeric"
                                    value={target}
                                    onChangeText={setTarget}
                                />
                            </>
                        )}

                        {modalType === 'contribute' && (
                            <TextInput
                                style={styles.input}
                                placeholder="Amount (€)"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                autoFocus
                            />
                        )}

                        {modalType === 'artifact' && (
                            <TextInput
                                style={styles.input}
                                placeholder="Anchor Title (e.g. Dream House Photo)"
                                value={artifactTitle}
                                onChangeText={setArtifactTitle}
                                autoFocus
                            />
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={
                                    modalType === 'create' ? handleCreate : 
                                    modalType === 'contribute' ? handleContribute : 
                                    handleAddArtifact
                                }
                            >
                                <Text style={styles.saveButtonText}>
                                    {modalType === 'create' ? 'Create' : 'Add'}
                                </Text>
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
    header: { padding: 20, paddingTop: 60, backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 34, fontWeight: '700' },
    addButton: { padding: 4 },
    list: { padding: 16 },
    emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 40, fontSize: 16, fontStyle: 'italic' },
    goalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    goalName: { fontSize: 18, fontWeight: '600' },
    goalTypeTag: { backgroundColor: '#E5E5EA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    goalTypeText: { fontSize: 12, color: '#3A3A3C', textTransform: 'capitalize' },
    progressContainer: { height: 8, backgroundColor: '#E5E5EA', borderRadius: 4, marginBottom: 12, overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: '#34C759' },
    goalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    progressText: { fontSize: 14, color: '#8E8E93' },
    contributeButton: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    contributeButtonText: { color: '#FFFFFF', fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
    input: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },
    cancelButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#F2F2F7' },
    cancelButtonText: { color: '#8E8E93', fontSize: 16, fontWeight: '600' },
    saveButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#007AFF' },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    artifactsSection: { marginTop: 16, marginBottom: 16 },
    artifactsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    artifactsTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase' },
    artifactsList: { flexDirection: 'row' },
    artifactBadge: { backgroundColor: '#F2F2F7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
    artifactBadgeText: { fontSize: 12, color: '#3A3A3C' },
    emptyArtifacts: { fontSize: 12, color: '#C7C7CC', fontStyle: 'italic' },
});
