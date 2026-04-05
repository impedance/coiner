import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useBehavior } from '../../src/hooks/useBehavior';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PracticeDefinition } from '../../src/types';

export default function BehaviorScreen() {
    const { activeCycle, definitions, checkins, streak, loading, startCycle, setCheckin, completeCycle } = useBehavior();
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
                        const checkin = checkins.find(c => c.practice_definition_id === def.id);
                        const status = checkin?.status || 'missed';
                        
                        return (
                            <View key={def.id} style={styles.practiceCard}>
                                <View style={styles.practiceHeader}>
                                    <View style={styles.practiceTextContainer}>
                                        <Text style={styles.practiceName}>{def.title}</Text>
                                        <Text style={styles.practiceScope}>{def.scope}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.levelSelector}>
                                    <TouchableOpacity 
                                        style={[styles.levelBtn, status === 'missed' && styles.levelBtnMissed]} 
                                        onPress={() => setCheckin(def.id, 'missed')}
                                    >
                                        <Ionicons name="close" size={20} color={status === 'missed' ? '#FFFFFF' : '#8E8E93'} />
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={[styles.levelBtn, status === 'minimum' && styles.levelBtnMin]} 
                                        onPress={() => setCheckin(def.id, 'minimum')}
                                    >
                                        <Text style={[styles.levelBtnText, status === 'minimum' && styles.levelBtnTextActive]}>MIN</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={[styles.levelBtn, status === 'optimum' && styles.levelBtnOpt]} 
                                        onPress={() => setCheckin(def.id, 'optimum')}
                                    >
                                        <Text style={[styles.levelBtnText, status === 'optimum' && styles.levelBtnTextActive]}>OPT</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={[styles.levelBtn, status === 'maximum' && styles.levelBtnMax]} 
                                        onPress={() => setCheckin(def.id, 'maximum')}
                                    >
                                        <Text style={[styles.levelBtnText, status === 'maximum' && styles.levelBtnTextActive]}>MAX</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}

                    <TouchableOpacity
                        style={styles.completeCycleButton}
                        onPress={() => setShowCompleteModal(true)}
                    >
                        <Text style={styles.completeCycleButtonText}>Finish Cycle</Text>
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
    cycleCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
    cycleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    cycleTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E' },
    cycleSub: { color: '#8E8E93', fontSize: 14, marginTop: 4, fontWeight: '500' },
    streakContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
    streakText: { marginLeft: 6, fontSize: 18, fontWeight: '800', color: '#FF9500' },
    progressContainer: { height: 8, backgroundColor: '#E5E5EA', borderRadius: 4, marginBottom: 28, overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: '#007AFF' },
    sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#1C1C1E' },
    practiceCard: { backgroundColor: '#F9F9F9', borderRadius: 20, padding: 16, marginBottom: 16 },
    practiceHeader: { marginBottom: 12 },
    practiceTextContainer: { flex: 1 },
    practiceName: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
    practiceScope: { fontSize: 13, color: '#8E8E93', textTransform: 'capitalize', marginTop: 2 },
    levelSelector: { flexDirection: 'row', gap: 8 },
    levelBtn: { flex: 1, height: 44, borderRadius: 12, backgroundColor: '#E5E5EA', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
    levelBtnMissed: { backgroundColor: '#FF3B30' },
    levelBtnMin: { backgroundColor: '#FF9500' },
    levelBtnOpt: { backgroundColor: '#007AFF' },
    levelBtnMax: { backgroundColor: '#34C759' },
    levelBtnText: { fontSize: 12, fontWeight: '800', color: '#8E8E93' },
    levelBtnTextActive: { color: '#FFFFFF' },
    emptyState: { alignItems: 'center', marginTop: 60, padding: 20 },
    emptyTitle: { fontSize: 26, fontWeight: '800', marginTop: 24, marginBottom: 12, color: '#1C1C1E' },
    emptyText: { textAlign: 'center', color: '#8E8E93', fontSize: 17, lineHeight: 24, marginBottom: 36 },
    startButton: { backgroundColor: '#007AFF', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 18, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    startButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '85%' },
    modalTitle: { fontSize: 24, fontWeight: '800', marginBottom: 20, color: '#1C1C1E' },
    selectionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    selectionText: { marginLeft: 16, fontSize: 17, fontWeight: '500' },
    modalButtons: { flexDirection: 'row', gap: 14, marginTop: 32 },
    cancelButton: { flex: 1, padding: 18, borderRadius: 16, alignItems: 'center', backgroundColor: '#F2F2F7' },
    cancelButtonText: { color: '#8E8E93', fontSize: 17, fontWeight: '700' },
    confirmButton: { flex: 2, padding: 18, borderRadius: 16, alignItems: 'center', backgroundColor: '#007AFF' },
    confirmButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
    disabledButton: { opacity: 0.5 },
    moneyStepsLink: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginTop: 12, marginBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    moneyStepsIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
    moneyStepsText: { flex: 1, marginLeft: 16 },
    moneyStepsTitle: { fontSize: 18, fontWeight: '800', color: '#1C1C1E' },
    moneyStepsSub: { fontSize: 14, color: '#8E8E93', marginTop: 3 },
    completeCycleButton: { marginTop: 24, padding: 18, borderRadius: 16, backgroundColor: '#F2F2F7', alignItems: 'center' },
    completeCycleButtonText: { color: '#007AFF', fontSize: 17, fontWeight: '700' },
    modalSub: { fontSize: 16, color: '#8E8E93', marginBottom: 24, lineHeight: 22 },
    completeOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 16, gap: 12 },
    completeOptionText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});

