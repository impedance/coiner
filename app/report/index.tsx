import React from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useReports } from '../../src/hooks/useReports';
import { Ionicons } from '@expo/vector-icons';

export default function ReportsScreen() {
    const { 
        spendingByCategory, incomeVsExpense, reserveTrend, joyTrend, 
        goalsSummary, cycleSummary, monthOffset, setMonthOffset, 
        activeMonthKey, loading 
    } = useReports();

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const totalSpending = spendingByCategory.reduce((sum: number, c: any) => sum + c.amount_cents, 0);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Reports</Text>
                
                {/* Month Selector */}
                <View style={styles.monthSelector}>
                    <TouchableOpacity 
                        style={[styles.monthButton, monthOffset === -1 && styles.monthButtonActive]} 
                        onPress={() => setMonthOffset(-1)}
                    >
                        <Text style={[styles.monthButtonText, monthOffset === -1 && styles.monthButtonTextActive]}>Last Month</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.monthButton, monthOffset === 0 && styles.monthButtonActive]} 
                        onPress={() => setMonthOffset(0)}
                    >
                        <Text style={[styles.monthButtonText, monthOffset === 0 && styles.monthButtonTextActive]}>This Month</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Income vs Expense Bar */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Month Summary ({activeMonthKey})</Text>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Income</Text>
                        <Text style={[styles.summaryValue, { color: '#34C759' }]}>
                            {(incomeVsExpense.income / 100).toFixed(0)}€
                        </Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Expense</Text>
                        <Text style={[styles.summaryValue, { color: '#FF3B30' }]}>
                            {(incomeVsExpense.expense / 100).toFixed(0)}€
                        </Text>
                    </View>
                </View>
                <View style={styles.comparisonBarContainer}>
                    <View style={[styles.incomeBar, { flex: incomeVsExpense.income || 1 }]} />
                    <View style={[styles.expenseBar, { flex: incomeVsExpense.expense || 1 }]} />
                </View>
            </View>

            {/* Joy Fund Progress */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Joy Fund Usage</Text>
                    <Ionicons name="heart" size={20} color="#FF2D55" />
                </View>
                <View style={styles.statsRow}>
                    <View>
                        <Text style={styles.statsMain}>{(joyTrend.current / 100).toFixed(0)}€</Text>
                        <Text style={styles.statsSub}>spent of {(joyTrend.target / 100).toFixed(0)}€ bucket</Text>
                    </View>
                    <View style={styles.statsIconBox}>
                        <Ionicons 
                            name={joyTrend.current > joyTrend.target ? "alert-circle" : "checkmark-circle"} 
                            size={32} 
                            color={joyTrend.current > joyTrend.target ? "#FF3B30" : "#34C759"} 
                        />
                    </View>
                </View>
                <View style={styles.progressBarContainer}>
                    <View 
                        style={[
                            styles.progressBar, 
                            { 
                                width: `${Math.min(1, joyTrend.target > 0 ? joyTrend.current / joyTrend.target : 0) * 100}%`,
                                backgroundColor: '#FF2D55'
                            }
                        ]} 
                    />
                </View>
            </View>

            {/* Spending by Category */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Spending by Category</Text>
                {spendingByCategory.length === 0 ? (
                    <Text style={styles.emptyText}>No spending recorded for this period.</Text>
                ) : (
                    spendingByCategory.map((cat, index) => {
                        const percentage = totalSpending > 0 ? (cat.amount_cents / totalSpending) : 0;
                        const hue = (index * 45) % 360; 
                        return (
                            <View key={cat.id} style={styles.categoryItem}>
                                <View style={styles.categoryHeader}>
                                    <Text style={styles.categoryName}>{cat.name}</Text>
                                    <Text style={styles.categoryValue}>
                                        {(cat.amount_cents / 100).toFixed(0)}€ ({(percentage * 100).toFixed(0)}%)
                                    </Text>
                                </View>
                                <View style={styles.progressBarContainer}>
                                    <View 
                                        style={[
                                            styles.progressBar, 
                                            { 
                                                width: `${percentage * 100}%`,
                                                backgroundColor: `hsl(${hue}, 70%, 55%)`
                                            }
                                        ]} 
                                    />
                                </View>
                            </View>
                        );
                    })
                )}
            </View>

            {/* Goals Progress */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Active Goals ({goalsSummary.count})</Text>
                    <Ionicons name="trophy" size={20} color="#FFCC00" />
                </View>
                <View style={styles.statsRow}>
                    <View>
                        <Text style={styles.statsMain}>{(goalsSummary.percentage * 100).toFixed(0)}%</Text>
                        <Text style={styles.statsSub}>
                            {(goalsSummary.totalCurrent / 100).toFixed(0)}€ gathered
                        </Text>
                    </View>
                    <Text style={styles.statsRight}>
                        Target: {(goalsSummary.totalTarget / 100).toFixed(0)}€
                    </Text>
                </View>
                <View style={styles.largeProgressBarContainer}>
                    <View 
                        style={[
                            styles.largeProgressBar, 
                            { 
                                width: `${goalsSummary.percentage * 100}%`,
                                backgroundColor: '#FFCC00'
                            }
                        ]} 
                    />
                </View>
            </View>

            {/* Behavior Cycle */}
            {cycleSummary && (
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Active Cycle: {cycleSummary.title}</Text>
                        <Ionicons name="calendar" size={20} color="#5856D6" />
                    </View>
                    <View style={styles.cycleInfo}>
                        <View style={styles.cycleProgressContainer}>
                            <Text style={styles.cycleProgressValue}>{(cycleSummary.progress * 100).toFixed(0)}%</Text>
                            <Text style={styles.cycleProgressLabel}>Execution</Text>
                        </View>
                        <View style={styles.cycleDetails}>
                            <Text style={styles.cycleDays}>{cycleSummary.daysLeft} days left</Text>
                            <Text style={styles.cycleHint}>Keep your streak alive!</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Reserve Progress */}
            <View style={[styles.card, { marginBottom: 40 }]}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Reserve Movement</Text>
                    <Ionicons name="shield-checkmark" size={20} color="#FF9500" />
                </View>
                <View style={styles.reserveStats}>
                    <Text style={styles.reserveMain}>
                        {(reserveTrend.current / 100).toFixed(0)}€
                    </Text>
                    <Text style={styles.reserveTarget}>
                        of {(reserveTrend.target / 100).toFixed(0)}€ goal
                    </Text>
                </View>
                <View style={styles.largeProgressBarContainer}>
                    <View 
                        style={[
                            styles.largeProgressBar, 
                            { 
                                width: `${Math.min(1, reserveTrend.target > 0 ? reserveTrend.current / reserveTrend.target : 0) * 100}%`,
                                backgroundColor: '#FF9500'
                            }
                        ]} 
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    content: { padding: 16, paddingTop: 60 },
    header: { marginBottom: 24 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 34, fontWeight: '800', marginBottom: 16, color: '#1C1C1E' },
    monthSelector: { flexDirection: 'row', backgroundColor: '#E5E5EA', borderRadius: 8, padding: 2 },
    monthButton: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 6 },
    monthButtonActive: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    monthButtonText: { fontSize: 13, fontWeight: '500', color: '#8E8E93' },
    monthButtonTextActive: { color: '#000000' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 10 },
    cardTitle: { fontSize: 17, fontWeight: '600', marginBottom: 16, color: '#1C1C1E' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
    summaryItem: { alignItems: 'center' },
    summaryLabel: { fontSize: 12, color: '#8E8E93', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
    summaryValue: { fontSize: 24, fontWeight: '800' },
    summaryDivider: { width: 1, height: '100%', backgroundColor: '#F2F2F7' },
    comparisonBarContainer: { height: 10, flexDirection: 'row', borderRadius: 5, overflow: 'hidden' },
    incomeBar: { backgroundColor: '#34C759' },
    expenseBar: { backgroundColor: '#FF3B30' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
    statsMain: { fontSize: 32, fontWeight: '800', color: '#1C1C1E' },
    statsSub: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
    statsRight: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
    statsIconBox: { justifyContent: 'center' },
    categoryItem: { marginBottom: 14 },
    categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    categoryName: { fontSize: 15, fontWeight: '500', color: '#1C1C1E' },
    categoryValue: { fontSize: 13, color: '#8E8E93' },
    progressBarContainer: { height: 8, backgroundColor: '#F2F2F7', borderRadius: 4, overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: 4 },
    largeProgressBarContainer: { height: 12, backgroundColor: '#F2F2F7', borderRadius: 6, overflow: 'hidden' },
    largeProgressBar: { height: '100%', borderRadius: 6 },
    cycleInfo: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    cycleProgressContainer: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#5856D6', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' },
    cycleProgressValue: { fontSize: 20, fontWeight: '800', color: '#5856D6' },
    cycleProgressLabel: { fontSize: 10, color: '#8E8E93', textTransform: 'uppercase' },
    cycleDetails: { flex: 1 },
    cycleDays: { fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
    cycleHint: { fontSize: 14, color: '#34C759', marginTop: 4, fontWeight: '500' },
    reserveStats: { alignItems: 'center', marginBottom: 16 },
    reserveMain: { fontSize: 36, fontWeight: '800', color: '#1C1C1E' },
    reserveTarget: { fontSize: 15, color: '#8E8E93', marginTop: 4 },
    emptyText: { textAlign: 'center', color: '#C7C7CC', paddingVertical: 20, fontStyle: 'italic' },
});
