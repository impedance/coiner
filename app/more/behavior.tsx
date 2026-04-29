import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useBehavior } from '../../src/hooks/useBehavior';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Layout } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import * as Haptics from 'expo-haptics';

export default function BehaviorScreen() {
    const { activeCycle, definitions, checkins, streak, loading, setCheckin, completeCycle } = useBehavior();
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const router = useRouter();

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

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Behavior</Text>
                    <Text style={styles.subtitle}>Identity Shift Protocol</Text>
                </View>
                {activeCycle && (
                    <View style={[styles.modeBadge, activeCycle.mode === 'hard' && styles.modeBadgeHard]}>
                        <Text style={styles.modeBadgeText}>{activeCycle.mode.toUpperCase()}</Text>
                    </View>
                )}
            </View>

            {activeCycle ? (
                <View style={styles.cycleCard}>
                    <GlassCard style={styles.cycleInfo}>
                        <View style={styles.cycleHeader}>
                            <View style={{ flex: 1 }}>
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

                        <Text style={styles.sectionTitle}>Daily Practices</Text>
                        {definitions.map(def => {
                            const checkin = checkins.find(c => c.practice_definition_id === def.id);
                            const status = checkin?.status || 'missed';
                            
                            return (
                                <View key={def.id} style={styles.practiceCard}>
                                    <View style={styles.practiceHeader}>
                                        <Text style={styles.practiceName}>{def.title}</Text>
                                        <Text style={styles.practiceScope}>{def.scope}</Text>
                                    </View>
                                    
                                    <View style={styles.levelSelector}>
                                        {[
                                            { id: 'missed', label: '✖', color: Colors.expense },
                                            { id: 'minimum', label: 'MIN', color: '#FF9500' },
                                            { id: 'optimum', label: 'OPT', color: Colors.primary },
                                            { id: 'maximum', label: 'MAX', color: Colors.income },
                                        ].map(lvl => (
                                            <TouchableOpacity 
                                                key={lvl.id}
                                                style={[
                                                    styles.levelBtn, 
                                                    status === lvl.id && { backgroundColor: lvl.color }
                                                ]} 
                                                onPress={() => {
                                                    setCheckin(def.id, lvl.id as any);
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                }}
                                            >
                                                <Text style={[styles.levelBtnText, status === lvl.id && styles.levelBtnTextActive]}>
                                                    {lvl.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            );
                        })}

                        <TouchableOpacity
                            style={styles.completeCycleButton}
                            onPress={() => setShowCompleteModal(true)}
                        >
                            <Text style={styles.completeCycleButtonText}>Finish Cycle early</Text>
                        </TouchableOpacity>
                    </GlassCard>
                </View>
            ) : (
                <GlassCard style={styles.emptyState}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="rocket-outline" size={48} color={Colors.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>Initiate Growth</Text>
                    <Text style={styles.emptyText}>Behavior cycles are focused sprints to upgrade your lifestyle norms. Start a new one to begin tracking.</Text>
                    
                    <TouchableOpacity 
                        style={styles.startButton}
                        onPress={() => router.push('/more/new-cycle' as any)}
                    >
                        <Text style={styles.startButtonText}>Start New Cycle</Text>
                    </TouchableOpacity>
                </GlassCard>
            )}

            <TouchableOpacity 
                style={styles.moneyStepsLink}
                onPress={() => router.push('/more/money-steps')}
            >
                <GlassCard style={styles.moneyStepsCard}>
                    <View style={styles.moneyStepsIcon}>
                        <Ionicons name="trending-up" size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.moneyStepsText}>
                        <Text style={styles.moneyStepsTitle}>Money Steps</Text>
                        <Text style={styles.moneyStepsSub}>Track your lifestyle upgrades</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                </GlassCard>
            </TouchableOpacity>

            <Modal visible={showCompleteModal} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowCompleteModal(false)} />
                    <GlassCard style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Cycle Ritual</Text>
                        <Text style={styles.modalSub}>How did this sprint go?</Text>

                        <TouchableOpacity
                            style={[styles.completeOption, { backgroundColor: Colors.income }]}
                            onPress={() => {
                                completeCycle('completed');
                                setShowCompleteModal(false);
                            }}
                        >
                            <Ionicons name="trophy" size={22} color="#FFFFFF" />
                            <Text style={styles.completeOptionText}>Successfully Completed</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.completeOption, { backgroundColor: Colors.expense, marginTop: 12 }]}
                            onPress={() => {
                                completeCycle('failed');
                                setShowCompleteModal(false);
                            }}
                        >
                            <Ionicons name="refresh" size={22} color="#FFFFFF" />
                            <Text style={styles.completeOptionText}>Abort & Start Fresh</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowCompleteModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Continue Tracking</Text>
                        </TouchableOpacity>
                    </GlassCard>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    content: { padding: 24, paddingTop: 60, width: '100%', maxWidth: Layout.MAX_WIDTH, alignSelf: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
    title: { ...Typography.h1, fontSize: 36 },
    subtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: 2 },
    modeBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    modeBadgeHard: { backgroundColor: Colors.expense },
    modeBadgeText: { fontSize: 11, fontWeight: '900', color: Colors.text, letterSpacing: 1 },
    cycleCard: { marginBottom: 32 },
    cycleInfo: { padding: 24, borderRadius: 32 },
    cycleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    cycleTitle: { ...Typography.h3, fontSize: 24 },
    cycleSub: { ...Typography.body, color: Colors.textSecondary, marginTop: 4 },
    streakContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'hsla(35, 100%, 50%, 0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
    streakText: { marginLeft: 8, fontSize: 20, fontWeight: '900', color: '#FF9500' },
    progressContainer: { height: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 5, marginBottom: 32, overflow: 'hidden', borderWidth: 1, borderColor: Colors.glassBorder },
    progressBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 5 },
    sectionTitle: { ...Typography.label, color: Colors.textSecondary, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },
    practiceCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: Colors.glassBorder },
    practiceHeader: { marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    practiceName: { ...Typography.bodyBold, fontSize: 17 },
    practiceScope: { ...Typography.small, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    levelSelector: { flexDirection: 'row', gap: 10 },
    levelBtn: { flex: 1, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.glassBorder },
    levelBtnText: { fontSize: 11, fontWeight: '900', color: Colors.textSecondary },
    levelBtnTextActive: { color: '#FFFFFF' },
    emptyState: { alignItems: 'center', padding: 40, borderRadius: 32 },
    emptyIconContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'hsla(210, 100%, 50%, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    emptyTitle: { ...Typography.h2, marginBottom: 12 },
    emptyText: { textAlign: 'center', color: Colors.textSecondary, fontSize: 16, lineHeight: 24, marginBottom: 32 },
    startButton: { backgroundColor: Colors.primary, paddingHorizontal: 40, paddingVertical: 18, borderRadius: 20, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
    startButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    moneyStepsLink: { marginBottom: 40 },
    moneyStepsCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 28 },
    moneyStepsIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    moneyStepsText: { flex: 1, marginLeft: 16 },
    moneyStepsTitle: { ...Typography.bodyBold, fontSize: 18 },
    moneyStepsSub: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
    completeCycleButton: { marginTop: 24, padding: 20, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', borderWidth: 1, borderColor: Colors.glassBorder },
    completeCycleButtonText: { color: Colors.primary, fontSize: 16, fontWeight: '800' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject },
    modalContent: { width: '85%', maxWidth: 340, padding: 32, borderRadius: 32 },
    modalTitle: { ...Typography.h3, marginBottom: 8, textAlign: 'center' },
    modalSub: { ...Typography.body, color: Colors.textSecondary, marginBottom: 32, textAlign: 'center' },
    completeOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 20, gap: 12 },
    completeOptionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
    cancelButton: { marginTop: 16, padding: 16, alignItems: 'center' },
    cancelButtonText: { ...Typography.bodyMedium, color: Colors.textSecondary },
});
