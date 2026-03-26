import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useWeeklyReview } from '../../src/hooks/useWeeklyReview';
import { Ionicons } from '@expo/vector-icons';

export default function ReviewScreen() {
    // Current week calculation
    const { weekKey, periodStart, periodEnd } = useMemo(() => {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        const year = start.getFullYear();
        const firstDayOfYear = new Date(year, 0, 1);
        const days = Math.floor((start.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);

        return {
            weekKey: `${year}-${String(week).padStart(2, '0')}`,
            periodStart: start.toISOString(),
            periodEnd: end.toISOString()
        };
    }, []);

    const { review, stats, loading, saveReview } = useWeeklyReview(weekKey, periodStart, periodEnd);

    const [reflection, setReflection] = useState('');
    const [nextFocus, setNextFocus] = useState('');

    React.useEffect(() => {
        if (review) {
            setReflection(review.reflection || '');
            setNextFocus(review.next_focus || '');
        }
    }, [review]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const handleSave = async () => {
        await saveReview({ reflection, next_focus: nextFocus });
        alert('Weekly review saved!');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Weekly Review</Text>
                    <Text style={styles.subtitle}>Week {weekKey.split('-')[1]}, {new Date(periodStart).toLocaleDateString()} - {new Date(periodEnd).toLocaleDateString()}</Text>
                </View>

                <View style={styles.statsCard}>
                    <View style={styles.statRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Income</Text>
                            <Text style={[styles.statValue, { color: '#34C759' }]}>{(stats.income / 100).toFixed(2)} €</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Expenses</Text>
                            <Text style={[styles.statValue, { color: '#FF3B30' }]}>{(stats.expense / 100).toFixed(2)} €</Text>
                        </View>
                    </View>
                    <View style={styles.netRow}>
                        <Text style={styles.netLabel}>Net Cash Flow</Text>
                        <Text style={[styles.netValue, { color: stats.income - stats.expense >= 0 ? '#34C759' : '#FF3B30' }]}>
                            {((stats.income - stats.expense) / 100).toFixed(2)} €
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reflection</Text>
                    <Text style={styles.sectionDesc}>What went well this week? Where did you struggle?</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={4}
                        placeholder="Write your thoughts here..."
                        value={reflection}
                        onChangeText={setReflection}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Next Week's Focus</Text>
                    <Text style={styles.sectionDesc}>What is your primary financial goal for next week?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., No dining out, save 50€ more..."
                        value={nextFocus}
                        onChangeText={setNextFocus}
                    />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Complete Review</Text>
                </TouchableOpacity>

                {review && (
                    <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                        <Text style={styles.completedText}>Review completed on {new Date(review.updated_at).toLocaleDateString()}</Text>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollView: { flex: 1 },
    content: { padding: 20 },
    header: { marginBottom: 24, paddingTop: 40 },
    title: { fontSize: 34, fontWeight: '700', marginBottom: 4 },
    subtitle: { fontSize: 16, color: '#8E8E93' },
    statsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
    statRow: { flexDirection: 'row', marginBottom: 20 },
    statBox: { flex: 1 },
    statLabel: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: '700' },
    netRow: { borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    netLabel: { fontSize: 16, fontWeight: '600' },
    netValue: { fontSize: 18, fontWeight: '700' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
    sectionDesc: { fontSize: 14, color: '#8E8E93', marginBottom: 12 },
    textArea: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, fontSize: 16, minHeight: 120, textAlignVertical: 'top' },
    input: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, fontSize: 16 },
    saveButton: { backgroundColor: '#007AFF', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 12 },
    saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    completedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 8 },
    completedText: { color: '#34C759', fontSize: 14, fontWeight: '500' },
});
