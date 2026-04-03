import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useBehavior } from '../../src/hooks/useBehavior';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PracticeDefinition } from '../../src/types';

export default function BehaviorScreen() {
    const { activeCycle, definitions, checkins, streak, loading, startCycle, toggleCheckin, completeCycle } = useBehavior();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPracticeIds, setSelectedPracticeIds] = useState<string[]>([]);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const router = useRouter();

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    const cycleProgress = useMemo(() => {
        if (!activeCycle) return 0;
        const start = new Date(activeCycle.start_date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return Math.min(1, Math.max(0, diffDays / activeCycle.duration_days));
    }, [activeCycle]);

    const currentDay = useMemo(() => {
        if (!activeCycle) return 0;
        const start = new Date(activeCycle.start_date);
        const now = new Date();
        return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }, [activeCycle]);

    const handleStartCycle = async () => {
        if (selectedPracticeIds.length === 0) return;
        await startCycle("New Behavior Cycle", 21, selectedPracticeIds);
        setModalVisible(false);
    };

    const togglePracticeSelection = (id: string) => {
        setSelectedPracticeIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Behavior</Text>

            {activeCycle ? (
                <View style={styles.cycleCard}>
                    <View style={styles.cycleHeader}>
                        <View>
                            <Text style={styles.cycleTitle}>{activeCycle.title}</Text>
                            <Text style={styles.cycleSub}>Day {currentDay} of {activeCycle.duration_days}</Text>
                        </View>
                        <View style={styles.streakContainer}>
                            <Ionicons name="flame" size={24} color="#FF9500" />
                            <Text style={styles.streakText}>{streak}</Text>
                        </View>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${cycleProgress * 100}%` }]} />
                    </View>

                    <Text style={styles.sectionTitle}>Today's Practices</Text>
                    {definitions.map(def => {
                        const isDone = checkins.some(c => c.practice_definition_id === def.id && c.status === 'done');
                        return (
                            <TouchableOpacity 
                                key={def.id} 
                                style={[styles.practiceItem, isDone && styles.practiceItemDone]}
                                onPress={() => toggleCheckin(def.id, isDone ? 'missed' : 'done')}
                            >
                                <Ionicons 
                                    name={isDone ? "checkmark-circle" : "ellipse-outline"} 
                                    size={28} 
                                    color={isDone ? "#34C759" : "#C7C7CC"} 
                                />
                                <View style={styles.practiceTextContainer}>
                                    <Text style={[styles.practiceName, isDone && styles.practiceNameDone]}>{def.title}</Text>
                                    <Text style={styles.practiceScope}>{def.scope}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    <TouchableOpacity
                        style={styles.completeCycleButton}
                        onPress={() => setShowCompleteModal(true)}
                    >
                        <Text style={styles.completeCycleButtonText}>Complete Cycle</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="rocket-outline" size={64} color="#007AFF" />
                    <Text style={styles.emptyTitle}>Ready to grow?</Text>
                    <Text style={styles.emptyText}>Start a 21-day behavior cycle to turn financial tracking into a permanent habit.</Text>
                    
                    <TouchableOpacity 
                        style={styles.startButton}
                        onPress={() => {
                            setSelectedPracticeIds(definitions.map(d => d.id));
                            setModalVisible(true);
                        }}
                    >
                        <Text style={styles.startButtonText}>Start New Cycle</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity 
                style={styles.moneyStepsLink}
                onPress={() => router.push('/more/money-steps')}
            >
                <View style={styles.moneyStepsIcon}>
                    <Ionicons name="trending-up" size={24} color="#007AFF" />
                </View>
                <View style={styles.moneyStepsText}>
                    <Text style={styles.moneyStepsTitle}>Money Steps</Text>
                    <Text style={styles.moneyStepsSub}>Track your lifestyle upgrades</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Practices</Text>
                        <FlatList
                            data={definitions}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.selectionItem}
                                    onPress={() => togglePracticeSelection(item.id)}
                                >
                                    <Ionicons 
                                        name={selectedPracticeIds.includes(item.id) ? "checkbox" : "square-outline"} 
                                        size={24} 
                                        color="#007AFF" 
                                    />
                                    <Text style={styles.selectionText}>{item.title}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.confirmButton, selectedPracticeIds.length === 0 && styles.disabledButton]} 
                                onPress={handleStartCycle}
                                disabled={selectedPracticeIds.length === 0}
                            >
                                <Text style={styles.confirmButtonText}>Start 21-Day Cycle</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Complete Cycle Modal */}
            <Modal visible={showCompleteModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Complete Cycle</Text>
                        <Text style={styles.modalSub}>How did you do?</Text>

                        <TouchableOpacity
                            style={[styles.completeOption, { backgroundColor: '#34C759' }]}
                            onPress={() => {
                                completeCycle('completed');
                                setShowCompleteModal(false);
                            }}
                        >
                            <Ionicons name="trophy" size={24} color="#FFFFFF" />
                            <Text style={styles.completeOptionText}>Successfully Completed</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.completeOption, { backgroundColor: '#FF3B30', marginTop: 12 }]}
                            onPress={() => {
                                completeCycle('failed');
                                setShowCompleteModal(false);
                            }}
                        >
                            <Ionicons name="refresh" size={24} color="#FFFFFF" />
                            <Text style={styles.completeOptionText}>Start Fresh (Reset)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowCompleteModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    content: { padding: 20, paddingTop: 60 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 34, fontWeight: 'bold', marginBottom: 24 },
    cycleCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, elevation: 5, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)' },
    cycleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    cycleTitle: { fontSize: 22, fontWeight: '700' },
    cycleSub: { color: '#8E8E93', fontSize: 14, marginTop: 2 },
    streakContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    streakText: { marginLeft: 4, fontSize: 18, fontWeight: '700', color: '#FF9500' },
    progressContainer: { height: 10, backgroundColor: '#E5E5EA', borderRadius: 5, marginBottom: 24, overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: '#007AFF' },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
    practiceItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 16, borderRadius: 16, marginBottom: 12 },
    practiceItemDone: { backgroundColor: '#F2FFF5' },
    practiceTextContainer: { marginLeft: 12 },
    practiceName: { fontSize: 16, fontWeight: '600' },
    practiceNameDone: { color: '#8E8E93', textDecorationLine: 'line-through' },
    practiceScope: { fontSize: 12, color: '#8E8E93', textTransform: 'capitalize' },
    emptyState: { alignItems: 'center', marginTop: 60, padding: 20 },
    emptyTitle: { fontSize: 24, fontWeight: '700', marginTop: 20, marginBottom: 12 },
    emptyText: { textAlign: 'center', color: '#8E8E93', fontSize: 16, lineHeight: 22, marginBottom: 32 },
    startButton: { backgroundColor: '#007AFF', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
    startButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
    selectionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    selectionText: { marginLeft: 12, fontSize: 16 },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
    cancelButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#F2F2F7' },
    cancelButtonText: { color: '#8E8E93', fontSize: 16, fontWeight: '600' },
    confirmButton: { flex: 2, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#007AFF' },
    confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    disabledButton: { opacity: 0.5 },
    moneyStepsLink: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginTop: 24, marginBottom: 40, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
    moneyStepsIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
    moneyStepsText: { flex: 1, marginLeft: 16 },
    moneyStepsTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
    moneyStepsSub: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
    completeCycleButton: { marginTop: 20, padding: 16, borderRadius: 12, backgroundColor: '#F2F2F7', alignItems: 'center' },
    completeCycleButtonText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
    modalSub: { fontSize: 14, color: '#8E8E93', marginBottom: 20 },
    completeOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
    completeOptionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
