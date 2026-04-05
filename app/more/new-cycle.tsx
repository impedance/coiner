import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useBehavior } from '../../src/hooks/useBehavior';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

const DURATIONS = [
    { label: '7 Days', value: 7, desc: 'Introductory sprint' },
    { label: '21 Days', value: 21, desc: 'Habit formation' },
    { label: '30 Days', value: 30, desc: 'Lifestyle shift' },
    { label: '90 Days', value: 90, desc: 'Identity transformation' },
];

export default function NewCycleScreen() {
    const { definitions, startCycle, loading } = useBehavior();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [days, setDays] = useState(21);
    const [selectedPractices, setSelectedPractices] = useState<string[]>([]);
    const [mode, setMode] = useState<'soft' | 'hard'>('soft');
    const [targetLevel, setTargetLevel] = useState<'minimum' | 'target' | 'hero'>('minimum');

    const handleTogglePractice = (id: string) => {
        if (selectedPractices.includes(id)) {
            setSelectedPractices(prev => prev.filter(p => p !== id));
        } else {
            setSelectedPractices(prev => [...prev, id]);
        }
    };

    const handleStart = async () => {
        if (!title) {
            Alert.alert('Error', 'Please enter a cycle title.');
            return;
        }
        if (selectedPractices.length === 0) {
            Alert.alert('Error', 'Please select at least one practice to track.');
            return;
        }

        try {
            await startCycle(title, days, selectedPractices, mode, targetLevel);
            router.replace('/(tabs)/behavior');
        } catch (error) {
            Alert.alert('Error', 'Failed to start cycle.');
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Start Behavioral Cycle', headerTitleStyle: { fontWeight: '700' } }} />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                
                {/* Section: Title */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Cycle Title</Text>
                    <TextInput 
                        style={styles.titleInput}
                        placeholder="e.g. Financial Fast, Discipline Month"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Section: Duration */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Duration</Text>
                    <View style={styles.durationGrid}>
                        {DURATIONS.map(d => (
                            <TouchableOpacity 
                                key={d.value}
                                style={[styles.durationCard, days === d.value && styles.cardActive]}
                                onPress={() => setDays(d.value)}
                            >
                                <Text style={[styles.durationLabel, days === d.value && styles.textActive]}>{d.label}</Text>
                                <Text style={styles.durationDesc}>{d.desc}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Section: Mode */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Challenge Mode</Text>
                    <View style={styles.modeRow}>
                        <TouchableOpacity 
                            style={[styles.modeButton, mode === 'soft' && styles.cardActive]} 
                            onPress={() => setMode('soft')}
                        >
                            <Ionicons name="leaf-outline" size={20} color={mode === 'soft' ? '#007AFF' : '#8E8E93'} />
                            <Text style={[styles.modeText, mode === 'soft' && styles.textActive]}>SOFT</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.modeButton, mode === 'hard' && styles.cardActive]} 
                            onPress={() => setMode('hard')}
                        >
                            <Ionicons name="flame-outline" size={20} color={mode === 'hard' ? '#007AFF' : '#8E8E93'} />
                            <Text style={[styles.modeText, mode === 'hard' && styles.textActive]}>HARD</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.modeHint}>
                        {mode === 'soft' 
                            ? 'No-shame focus. Missing a day skips, but doesn\'t kill your progress.' 
                            : 'Discipline focus. Missing a day reset streaks and marks cycle failure if repeated.'}
                    </Text>
                </View>

                {/* Section: Practices */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Select Practices</Text>
                    {definitions.map(def => (
                        <TouchableOpacity 
                            key={def.id}
                            style={[styles.practiceItem, selectedPractices.includes(def.id) && styles.practiceItemActive]}
                            onPress={() => handleTogglePractice(def.id)}
                        >
                            <View style={styles.practiceText}>
                                <Text style={[styles.practiceTitle, selectedPractices.includes(def.id) && styles.textActive]}>{def.title}</Text>
                                <Text style={styles.practiceCode}>{def.code.toUpperCase()}</Text>
                            </View>
                            <Ionicons 
                                name={selectedPractices.includes(def.id) ? "checkbox" : "square-outline"} 
                                size={24} 
                                color={selectedPractices.includes(def.id) ? "#007AFF" : "#C7C7CC"} 
                            />
                        </TouchableOpacity>
                    ))}
                    {definitions.length === 0 && (
                        <Text style={styles.emptyText}>No practices in your library. Add some in settings!</Text>
                    )}
                </View>

                <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                    <Text style={styles.startButtonText}>Initiate Cycle</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scroll: { flex: 1 },
    content: { padding: 20, paddingBottom: 60 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    section: { marginBottom: 32 },
    sectionLabel: { fontSize: 13, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
    titleInput: { fontSize: 24, fontWeight: '700', borderBottomWidth: 2, borderBottomColor: '#F2F2F7', paddingVertical: 12, color: '#1C1C1E' },
    durationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    durationCard: { width: '48%', backgroundColor: '#F2F2F7', borderRadius: 16, padding: 16, gap: 4 },
    cardActive: { backgroundColor: '#F2F9FF', borderWidth: 1, borderColor: '#007AFF' },
    durationLabel: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
    durationDesc: { fontSize: 12, color: '#8E8E93' },
    textActive: { color: '#007AFF' },
    modeRow: { flexDirection: 'row', gap: 12 },
    modeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7', padding: 16, borderRadius: 16, gap: 8 },
    modeText: { fontSize: 16, fontWeight: '800', letterSpacing: 1, color: '#8E8E93' },
    modeHint: { fontSize: 13, color: '#8E8E93', marginTop: 12, fontStyle: 'italic', lineHeight: 18 },
    practiceItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#F2F2F7', marginBottom: 8 },
    practiceItemActive: { backgroundColor: '#F2F9FF', borderWidth: 1, borderColor: '#007AFF' },
    practiceText: { flex: 1 },
    practiceTitle: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
    practiceCode: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    emptyText: { color: '#C7C7CC', fontStyle: 'italic' },
    startButton: { backgroundColor: '#007AFF', padding: 20, borderRadius: 20, alignItems: 'center', marginTop: 20, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
    startButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
});
