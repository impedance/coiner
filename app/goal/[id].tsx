import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Image, TouchableOpacity, Modal, TextInput, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGoals } from '../../src/hooks/useGoals';
import { useArtifacts } from '../../src/hooks/useArtifacts';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { GoalContribution } from '../../src/types';

export default function GoalDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { goals, contribute, archiveGoal, getContributions, loading: goalsLoading } = useGoals();
    const { artifacts, loading: artifactsLoading, addArtifact } = useArtifacts(id);
    const router = useRouter();

    const [modalVisible, setModalVisible] = useState(false);
    const [contribModalVisible, setContribModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [contribAmount, setContribAmount] = useState('');
    const [contribNote, setContribNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [contributions, setContributions] = useState<GoalContribution[]>([]);

    const goal = goals.find(g => g.id === id);
    const goalArtifacts = artifacts;

    const loadContributions = useCallback(async () => {
        if (!id) return;
        const data = await getContributions(id);
        setContributions(data);
    }, [id, getContributions]);

    useEffect(() => {
        loadContributions();
    }, [loadContributions]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions to upload images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSaveArtifact = async () => {
        if (!title) {
            Alert.alert('Missing Title', 'Please provide a title for the anchor.');
            return;
        }

        setSaving(true);
        try {
            await addArtifact({
                title,
                description,
                image_uri: imageUri || undefined,
                unlock_rule_type: 'manual',
            });
            setModalVisible(false);
            setTitle('');
            setDescription('');
            setImageUri(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to save anchor.');
        } finally {
            setSaving(false);
        }
    };

    const handleContribute = async () => {
        if (!contribAmount || isNaN(parseFloat(contribAmount))) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount.');
            return;
        }
        if (!id) return;

        setSaving(true);
        try {
            await contribute(id, Math.round(parseFloat(contribAmount) * 100), contribNote);
            await loadContributions();
            setContribModalVisible(false);
            setContribAmount('');
            setContribNote('');
        } catch (error) {
            Alert.alert('Error', 'Failed to record contribution.');
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = () => {
        Alert.alert(
            'Archive Goal',
            'This goal will be hidden but your data is safe. You can restart or review it later.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Archive', 
                    style: 'destructive',
                    onPress: async () => {
                        if (id) {
                            await archiveGoal(id);
                            router.back();
                        }
                    }
                }
            ]
        );
    };

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
                <TouchableOpacity onPress={handleArchive}>
                    <Ionicons name="archive-outline" size={24} color="#8E8E93" />
                </TouchableOpacity>
            </View>

            {/* Main Visual Anchor */}
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
                    <View style={styles.statContainer}>
                        <Text style={styles.statLabel}>Current</Text>
                        <Text style={styles.statValue}>{(goal.current_cents / 100).toFixed(0)}€</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statContainer}>
                        <Text style={styles.statLabel}>Target</Text>
                        <Text style={styles.statValue}>{(goal.target_cents / 100).toFixed(0)}€</Text>
                    </View>
                </View>

                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${Math.min(1, progress) * 100}%` }]} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={styles.progressPercentage}>{(progress * 100).toFixed(1)}%</Text>
                    <TouchableOpacity onPress={() => setContribModalVisible(true)}>
                        <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>+ Contribute</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Anchors Section */}
            <View style={styles.section}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={styles.sectionTitle}>Emotional Anchors</Text>
                </View>
                {goalArtifacts.map(artifact => (
                    <View key={artifact.id} style={styles.artifactItem}>
                        <View style={styles.artifactIcon}>
                            <Ionicons name={artifact.image_uri ? "image" : "document-text"} size={24} color="#007AFF" />
                        </View>
                        <View style={styles.artifactText}>
                            <Text style={styles.artifactTitleText}>{artifact.title}</Text>
                            <Text style={styles.artifactNote} numberOfLines={2}>{artifact.description || 'Reason to win'}</Text>
                        </View>
                    </View>
                ))}
                
                <TouchableOpacity 
                    style={styles.addAnchorButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add-circle" size={20} color="#007AFF" />
                    <Text style={styles.addAnchorText}>Add New Anchor</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Contributions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Contributions</Text>
                {contributions.length === 0 ? (
                    <Text style={styles.placeholderText}>No contributions yet. Start saving!</Text>
                ) : (
                    contributions.map(contrib => (
                        <View key={contrib.id} style={styles.contributionItem}>
                            <View style={styles.contributionIcon}>
                                <Ionicons name="trending-up" size={20} color="#34C759" />
                            </View>
                            <View style={styles.contributionText}>
                                <Text style={styles.contributionAmount}>+{(contrib.amount_cents / 100).toFixed(2)}€</Text>
                                <Text style={styles.contributionDate}>{new Date(contrib.happened_at).toLocaleDateString()}</Text>
                            </View>
                            {contrib.note && <Text style={styles.contributionNote}>{contrib.note}</Text>}
                        </View>
                    ))
                )}
            </View>

            {/* New Anchor Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Emotional Anchor</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#8E8E93" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
                            {imageUri ? (
                                <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="camera" size={32} color="#007AFF" />
                                    <Text style={styles.imagePlaceholderText}>Choose Photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            placeholder="Anchor Title (e.g. My Dream House)"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="Why does this inspire you?"
                            multiline
                            value={description}
                            onChangeText={setDescription}
                        />

                        <TouchableOpacity 
                            style={[styles.saveButton, saving && styles.disabledButton]} 
                            onPress={handleSaveArtifact}
                            disabled={saving}
                        >
                            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Save Anchor</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Contribution Modal */}
            <Modal visible={contribModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Record Contribution</Text>
                            <TouchableOpacity onPress={() => setContribModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#8E8E93" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Amount (e.g. 50.00)"
                            keyboardType="decimal-pad"
                            value={contribAmount}
                            onChangeText={setContribAmount}
                            autoFocus
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Optional Note"
                            value={contribNote}
                            onChangeText={setContribNote}
                        />

                        <TouchableOpacity 
                            style={[styles.saveButton, { backgroundColor: '#34C759' }, saving && styles.disabledButton]} 
                            onPress={handleContribute}
                            disabled={saving}
                        >
                            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Record Progress</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    statContainer: { alignItems: 'center', flex: 1 },
    statLabel: { fontSize: 12, color: '#8E8E93', textTransform: 'uppercase', marginBottom: 4 },
    statValue: { fontSize: 24, fontWeight: '700', color: '#1C1C1E' },
    statDivider: { width: 1, height: '100%', backgroundColor: '#F2F2F7' },
    progressBarContainer: { height: 12, backgroundColor: '#F2F2F7', borderRadius: 6, overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: '#34C759' },
    progressPercentage: { fontSize: 13, color: '#8E8E93' },
    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: '#1C1C1E' },
    artifactItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12 },
    artifactIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
    artifactText: { marginLeft: 16, flex: 1 },
    artifactTitleText: { fontSize: 16, fontWeight: '600' },
    artifactNote: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
    addAnchorButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 8 },
    addAnchorText: { color: '#007AFF', fontWeight: '600', fontSize: 15 },
    contributionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 10 },
    contributionIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F2FFF5', justifyContent: 'center', alignItems: 'center' },
    contributionText: { marginLeft: 12, flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
    contributionAmount: { fontSize: 17, fontWeight: '700', color: '#34C759' },
    contributionDate: { fontSize: 13, color: '#8E8E93' },
    contributionNote: { fontSize: 13, color: '#8E8E93', marginLeft: 48, marginTop: -4, marginBottom: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700' },
    imageSelector: { height: 180, backgroundColor: '#F2F2F7', borderRadius: 16, overflow: 'hidden', marginBottom: 20, justifyContent: 'center', alignItems: 'center' },
    selectedImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    imagePlaceholder: { alignItems: 'center' },
    imagePlaceholderText: { color: '#007AFF', marginTop: 8, fontWeight: '600' },
    input: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 12 },
    saveButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    disabledButton: { opacity: 0.6 },
});
