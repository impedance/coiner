import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useWeeklyReview } from '../../src/hooks/useWeeklyReview';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { SimpleBarChart } from '../../src/components/SimpleBarChart';
import { CelebrationCard } from '../../src/components/CelebrationCard';
import * as Haptics from 'expo-haptics';

export default function ReviewScreen() {
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

    const { review, stats, history, loading, saveReview } = useWeeklyReview(weekKey, periodStart, periodEnd);

    const [reflection, setReflection] = useState('');
    const [nextFocus, setNextFocus] = useState('');
    const [celebrations, setCelebrations] = useState('');

    useEffect(() => {
        if (review) {
            setReflection(review.reflection || '');
            setNextFocus(review.next_focus || '');
            setCelebrations(review.celebrations || '');
        }
    }, [review]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const handleSave = async () => {
        await saveReview({ reflection, next_focus: nextFocus, celebrations });
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Success', 'Weekly review saved!');
    };

    const chartData = history.map(r => ({
        label: `W${r.week_key.split('-')[1]}`,
        value: r.reserve_delta_cents / 100
    }));

    // Add current week to chart data if not already there
    if (!history.find(r => r.week_key === weekKey)) {
        chartData.push({
            label: `W${weekKey.split('-')[1]}`,
            value: stats.reserve_delta / 100
        });
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Weekly Review</Text>
                    <Text style={styles.subtitle}>Week {weekKey.split('-')[1]}, {new Date(periodStart).toLocaleDateString()} - {new Date(periodEnd).toLocaleDateString()}</Text>
                </View>

                {/* Main Stats Card */}
                <GlassCard style={styles.statsCard}>
                    <View style={styles.statRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Income</Text>
                            <Text style={[styles.statValue, { color: Colors.income }]}>{(stats.income / 100).toFixed(2)} €</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Expenses</Text>
                            <Text style={[styles.statValue, { color: Colors.expense }]}>{(stats.expense / 100).toFixed(2)} €</Text>
                        </View>
                    </View>
                    <View style={styles.netRow}>
                        <Text style={styles.netLabel}>Net Cash Flow</Text>
                        <Text style={[styles.netValue, { color: stats.income - stats.expense >= 0 ? Colors.income : Colors.expense }]}>
                            {((stats.income - stats.expense) / 100).toFixed(2)} €
                        </Text>
                    </View>
                </GlassCard>

                {/* Reserve & Joy Highlights */}
                <View style={styles.highlightsContainer}>
                    <GlassCard style={styles.highlightCard}>
                        <Ionicons name="shield-checkmark" size={20} color={Colors.reserve} style={{ marginBottom: 8 }} />
                        <Text style={styles.highlightLabel}>Reserve Delta</Text>
                        <Text style={styles.highlightValue}>{(stats.reserve_delta / 100).toFixed(2)} €</Text>
                    </GlassCard>
                    <GlassCard style={styles.highlightCard}>
                        <Ionicons name="heart" size={20} color={Colors.joy} style={{ marginBottom: 8 }} />
                        <Text style={styles.highlightLabel}>Joy Delta</Text>
                        <Text style={styles.highlightValue}>{(stats.joy_delta / 100).toFixed(2)} €</Text>
                    </GlassCard>
                </View>

                {/* Visualization Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reserve Dynamics</Text>
                    <GlassCard style={styles.chartCard}>
                        <SimpleBarChart data={chartData} color={Colors.reserve} height={120} />
                    </GlassCard>
                </View>

                {/* Celebrations Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Weekly Wins</Text>
                    <Text style={styles.sectionDesc}>What financial wins did you have this week?</Text>
                    {celebrations.length > 20 && !loading && (
                        <CelebrationCard title="Great Progress!" description={celebrations} />
                    )}
                    <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={3}
                        placeholder="e.g., Avoided an impulse purchase, reached 50% of travel goal..."
                        value={celebrations}
                        onChangeText={setCelebrations}
                    />
                </View>

                {/* Reflection Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reflection</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={4}
                        placeholder="Write your deeper thoughts here..."
                        value={reflection}
                        onChangeText={setReflection}
                    />
                </View>

                <View style={[styles.section, { marginBottom: 40 }]}>
                    <Text style={styles.sectionTitle}>Next Week's Focus</Text>
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
                        <Ionicons name="checkmark-circle" size={20} color={Colors.income} />
                        <Text style={styles.completedText}>Review completed</Text>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollView: { flex: 1 },
    content: { padding: 20, paddingBottom: 60 },
    header: { marginBottom: 24, paddingTop: 60 },
    title: { ...Typography.h1 },
    subtitle: { ...Typography.small, color: Colors.textSecondary },
    statsCard: { padding: 20, marginBottom: 20 },
    statRow: { flexDirection: 'row', marginBottom: 20 },
    statBox: { flex: 1 },
    statLabel: { ...Typography.label },
    statValue: { ...Typography.h2 },
    netRow: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    netLabel: { ...Typography.bodyBold },
    netValue: { ...Typography.h2, fontSize: 24 },
    highlightsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    highlightCard: { flex: 1, padding: 16 },
    highlightLabel: { ...Typography.small, fontSize: 10, textTransform: 'uppercase' },
    highlightValue: { ...Typography.bodyBold, fontSize: 18 },
    section: { marginBottom: 24 },
    sectionTitle: { ...Typography.h3, marginBottom: 8 },
    sectionDesc: { ...Typography.small, marginBottom: 12 },
    chartCard: { padding: 12, paddingBottom: 24 },
    textArea: { backgroundColor: Colors.card, borderRadius: 20, padding: 16, fontSize: 16, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: Colors.glassBorder, color: Colors.text },
    input: { backgroundColor: Colors.card, borderRadius: 20, padding: 16, fontSize: 16, borderWidth: 1, borderColor: Colors.glassBorder, color: Colors.text },
    saveButton: { backgroundColor: Colors.primary, padding: 18, borderRadius: 20, alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    completedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 8 },
    completedText: { color: Colors.income, fontSize: 14, fontWeight: '600' },
});
