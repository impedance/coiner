import React from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGoals } from '../../src/hooks/useGoals';
import { useArtifacts } from '../../src/hooks/useArtifacts';
import { Ionicons } from '@expo/vector-icons';

export default function GoalDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { goals, contribute, loading: goalsLoading } = useGoals();
    const { artifacts, loading: artifactsLoading } = useArtifacts();
    const router = useRouter();

    const goal = goals.find(g => g.id === id);
    const goalArtifacts = artifacts.filter(a => a.goal_id === id);

    if (goalsLoading || artifactsLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!goal) {
        return (
            <View style={styles.centered}>
                <Text>Goal not found.</Text>
            </View>
        );
    }

    const progress = goal.target_cents > 0 ? (goal.current_cents / goal.target_cents) : 0;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>{goal.name}</Text>
            </View>

            {/* Main Visual Anchor (First Artifact with Image) */}
            {goalArtifacts.length > 0 && goalArtifacts[0].image_uri ? (
                <View style={styles.anchorContainer}>
                    <Image source={{ uri: goalArtifacts[0].image_uri }} style={styles.anchorImage} />
                    <View style={styles.anchorOverlay}>
                        <Text style={styles.anchorTitle}>{goalArtifacts[0].title}</Text>
                        <Text style={styles.anchorSub}>Emotional Anchor</Text>
                    </View>
                </View>
            ) : (
                <View style={[styles.anchorContainer, styles.placeholderAnchor]}>
                    <Ionicons name="images-outline" size={64} color="#C7C7CC" />
                    <Text style={styles.placeholderText}>Add a photo to visualize your goal</Text>
                </View>
            )}

            {/* Progress Card */}
            <View style={styles.card}>
                <View style={styles.row}>
                    <View>
                        <Text style={styles.statLabel}>Current</Text>
                        <Text style={styles.statValue}>{(goal.current_cents / 100).toFixed(0)}€</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View>
                        <Text style={styles.statLabel}>Target</Text>
                        <Text style={styles.statValue}>{(goal.target_cents / 100).toFixed(0)}€</Text>
                    </View>
                </View>

                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${Math.min(1, progress) * 100}%` }]} />
                </View>
                <Text style={styles.progressPercentage}>{(progress * 100).toFixed(1)}% complete</Text>
            </View>

            {/* Anchors Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emotional Anchors</Text>
                {goalArtifacts.map(artifact => (
                    <View key={artifact.id} style={styles.artifactItem}>
                        <View style={styles.artifactIcon}>
                            <Ionicons name={artifact.image_uri ? "image" : "document-text"} size={24} color="#007AFF" />
                        </View>
                        <View style={styles.artifactText}>
                            <Text style={styles.artifactTitleText}>{artifact.title}</Text>
                            <Text style={styles.artifactNote} numberOfLines={2}>{artifact.description || 'No description'}</Text>
                        </View>
                    </View>
                ))}
                
                <TouchableOpacity style={styles.addAnchorButton}>
                    <Ionicons name="add-circle" size={20} color="#007AFF" />
                    <Text style={styles.addAnchorText}>Add New Anchor</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Contributions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Contributions</Text>
                <Text style={styles.placeholderText}>Contributions will appear here.</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    content: { paddingBottom: 40 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#FFFFFF' },
    backButton: { marginRight: 12 },
    title: { fontSize: 22, fontWeight: '700', flex: 1 },
    anchorContainer: { height: 250, width: '100%', position: 'relative', overflow: 'hidden' },
    placeholderAnchor: { backgroundColor: '#E5E5EA', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { color: '#8E8E93', fontSize: 14, marginTop: 8 },
    anchorImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    anchorOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.4)' },
    anchorTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
    anchorSub: { color: '#E5E5EA', fontSize: 13, textTransform: 'uppercase', fontWeight: '600' },
    card: { backgroundColor: '#FFFFFF', margin: 20, borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
    statItem: { alignItems: 'center' },
    statLabel: { fontSize: 12, color: '#8E8E93', textTransform: 'uppercase', marginBottom: 4 },
    statValue: { fontSize: 24, fontWeight: '700', color: '#1C1C1E' },
    statDivider: { width: 1, height: '100%', backgroundColor: '#F2F2F7' },
    progressBarContainer: { height: 12, backgroundColor: '#F2F2F7', borderRadius: 6, overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: '#34C759' },
    progressPercentage: { textAlign: 'right', fontSize: 13, color: '#8E8E93', marginTop: 8 },
    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: '#1C1C1E' },
    artifactItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12 },
    artifactIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
    artifactText: { marginLeft: 16, flex: 1 },
    artifactTitleText: { fontSize: 16, fontWeight: '600' },
    artifactNote: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
    addAnchorButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 8 },
    addAnchorText: { color: '#007AFF', fontWeight: '600', fontSize: 15 },
});
