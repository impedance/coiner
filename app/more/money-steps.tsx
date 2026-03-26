import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useMoneySteps } from '../../src/hooks/useMoneySteps';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

export default function MoneyStepsScreen() {
    const { steps, loading, createStep, completeStep } = useMoneySteps();
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const router = useRouter();

    const handleCreate = async () => {
        if (!title) return;
        await createStep(title, desc, 'habit');
        setModalVisible(false);
        setTitle('');
        setDesc('');
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const activeSteps = steps.filter(s => s.status === 'active');
    const achievedSteps = steps.filter(s => s.status === 'achieved');

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Money Steps', headerTitleStyle: { fontWeight: '700' } }} />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                
                <Text style={styles.sectionTitle}>Active Training</Text>
                {activeSteps.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No active steps. Set a new lifestyle norm!</Text>
                    </View>
                ) : (
                    activeSteps.map(step => (
                        <View key={step.id} style={styles.stepCard}>
                            <View style={styles.stepHeader}>
                                <View style={styles.stepIcon}>
                                    <Ionicons name="trending-up" size={24} color="#007AFF" />
                                </View>
                                <View style={styles.stepText}>
                                    <Text style={styles.stepTitle}>{step.title}</Text>
                                    <Text style={styles.stepDesc}>{step.description}</Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.completeButton}
                                    onPress={() => completeStep(step.id)}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={32} color="#C7C7CC" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}

                {achievedSteps.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Achieved Milestones</Text>
                        {achievedSteps.map(step => (
                            <View key={step.id} style={[styles.stepCard, styles.achievedCard]}>
                                <View style={styles.stepHeader}>
                                    <Ionicons name="ribbon" size={24} color="#FF9500" />
                                    <View style={styles.stepText}>
                                        <Text style={styles.achievedTitle}>{step.title}</Text>
                                        <Text style={styles.achievedDate}>Achieved {new Date(step.achieved_at!).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                <TouchableOpacity 
                    style={styles.fab}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={30} color="#FFFFFF" />
                    <Text style={styles.fabText}>Set New Step</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Money Step</Text>
                        <Text style={styles.modalSub}>A "Money Step" is a specific upgrade in your behavioral standard or lifestyle norm.</Text>
                        
                        <TextInput 
                            style={styles.input} 
                            placeholder="Step Title (e.g. Always keep 500€ Reserve)"
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TextInput 
                            style={[styles.input, { height: 80 }]} 
                            placeholder="Why does this matter? (Description)"
                            multiline
                            value={desc}
                            onChangeText={setDesc}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleCreate}>
                                <Text style={styles.saveButtonText}>Start Step</Text>
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
    scroll: { flex: 1 },
    content: { padding: 20, paddingBottom: 100 },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', marginBottom: 16, letterSpacing: 0.5 },
    stepCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
    stepHeader: { flexDirection: 'row', alignItems: 'center' },
    stepIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
    stepText: { flex: 1, marginLeft: 16 },
    stepTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
    stepDesc: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
    completeButton: { padding: 4 },
    achievedCard: { opacity: 0.8, backgroundColor: '#F9F9F9' },
    achievedTitle: { fontSize: 16, fontWeight: '600', color: '#8E8E93', textDecorationLine: 'line-through' },
    achievedDate: { fontSize: 12, color: '#C7C7CC', marginTop: 2 },
    emptyCard: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#C7C7CC', fontStyle: 'italic', textAlign: 'center' },
    fab: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 28, gap: 8, elevation: 8, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    fabText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
    modalSub: { fontSize: 14, color: '#8E8E93', marginBottom: 24, lineHeight: 20 },
    input: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },
    cancelButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#F2F2F7' },
    cancelButtonText: { color: '#8E8E93', fontSize: 16, fontWeight: '600' },
    saveButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#007AFF' },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
