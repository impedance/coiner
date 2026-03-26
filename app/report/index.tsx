import React from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { useReports } from '../../src/hooks/useReports';
import { Ionicons } from '@expo/vector-icons';

export default function ReportsScreen() {
    const { spendingByCategory, incomeVsExpense, reserveTrend, loading } = useReports();

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const totalSpending = spendingByCategory.reduce((sum, c) => sum + c.amount_cents, 0);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Reports</Text>

            {/* Income vs Expense Bar */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Month Summary</Text>
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

            {/* Spending by Category */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Spending by Category</Text>
                {spendingByCategory.length === 0 ? (
                    <Text style={styles.emptyText}>No spending recorded this month.</Text>
                ) : (
                    spendingByCategory.map((cat, index) => {
                        const percentage = totalSpending > 0 ? (cat.amount_cents / totalSpending) : 0;
                        const hue = (index * 45) % 360; // Spread colors using HSL
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

            {/* Reserve Progress */}
            <View style={styles.card}>
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
    content: { padding: 20, paddingTop: 60 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 34, fontWeight: '700', marginBottom: 24 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 10 },
    cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#1C1C1E' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
    summaryItem: { alignItems: 'center' },
    summaryLabel: { fontSize: 13, color: '#8E8E93', textTransform: 'uppercase', marginBottom: 4 },
    summaryValue: { fontSize: 24, fontWeight: '700' },
    summaryDivider: { width: 1, height: '100%', backgroundColor: '#F2F2F7' },
    comparisonBarContainer: { height: 12, flexDirection: 'row', borderRadius: 6, overflow: 'hidden' },
    incomeBar: { backgroundColor: '#34C759', opacity: 0.8 },
    expenseBar: { backgroundColor: '#FF3B30', opacity: 0.8 },
    categoryItem: { marginBottom: 16 },
    categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    categoryName: { fontSize: 15, fontWeight: '500' },
    categoryValue: { fontSize: 14, color: '#8E8E93' },
    progressBarContainer: { height: 8, backgroundColor: '#F2F2F7', borderRadius: 4, overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: 4 },
    reserveStats: { alignItems: 'center', marginBottom: 16 },
    reserveMain: { fontSize: 36, fontWeight: '800', color: '#1C1C1E' },
    reserveTarget: { fontSize: 15, color: '#8E8E93', marginTop: 4 },
    largeProgressBarContainer: { height: 14, backgroundColor: '#F2F2F7', borderRadius: 7, overflow: 'hidden' },
    largeProgressBar: { height: '100%', borderRadius: 7 },
    emptyText: { textAlign: 'center', color: '#C7C7CC', paddingVertical: 20, fontStyle: 'italic' },
});
