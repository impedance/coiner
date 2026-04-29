import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useBehavior } from '../../src/hooks/useBehavior';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

export default function PracticesScreen() {
    const { definitions, loading, createDefinition } = useBehavior();
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');

    const handleCreate = async () => {
        if (!title || !code) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        await createDefinition(title, code);
        setModalVisible(false);
        setTitle('');
        setCode('');
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
            <Stack.Screen options={{ title: 'Practice Library', headerTitleStyle: { fontWeight: '700' } }} />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Available Practices</Text>
                <Text style={styles.sectionDescription}>
                    These are the behaviors you can choose from when starting a new Behavior Cycle.
                </Text>

                {definitions.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No practices defined yet.</Text>
                    </View>
                ) : (
                    definitions.map(def => (
                        <View key={def.id} style={styles.practiceCard}>
                            <View style={styles.practiceIcon}>
                                <Ionicons 
                                    name={def.is_system ? "construct" : "flask-outline"} 
                                    size={24} 
                                    color={def.is_system ? "#8E8E93" : "#007AFF"} 
                                />
                            </View>
                            <View style={styles.practiceText}>
                                <Text style={styles.practiceTitle}>{def.title}</Text>
                                <Text style={styles.practiceCode}>{def.code.toUpperCase()}</Text>
                            </View>
                            {def.is_system && (
                                <View style={styles.systemBadge}>
                                    <Text style={styles.systemBadgeText}>SYSTEM</Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={30} color="#FFFFFF" />
                <Text style={styles.fabText}>New Practice</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Practice</Text>
                        <Text style={styles.modalSub}>Define a behavior you want to track in future cycles.</Text>
                        
                        <Text style={styles.inputLabel}>Title</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="e.g. Daily Reserve Check"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.inputLabel}>Short Code</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="e.g. RESERVE_CHECK"
                            value={code}
                            onChangeText={setCode}
                            autoCapitalize="characters"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleCreate}>
                                <Text style={styles.saveButtonText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { flex: 1 },
    content: { padding: 20, paddingBottom: 100 },
    sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8, color: '#1C1C1E' },
    sectionDescription: { fontSize: 15, color: '#8E8E93', marginBottom: 24, lineHeight: 20 },
    practiceCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    practiceIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
    practiceText: { flex: 1, marginLeft: 16 },
    practiceTitle: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
    practiceCode: { fontSize: 12, color: '#8E8E93', marginTop: 2, fontWeight: '600' },
    systemBadge: { backgroundColor: '#E5E5EA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    systemBadgeText: { fontSize: 10, fontWeight: '700', color: '#8E8E93' },
    emptyCard: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#C7C7CC', fontStyle: 'italic' },
    fab: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 28, gap: 8, elevation: 8, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    fabText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
    modalSub: { fontSize: 14, color: '#8E8E93', marginBottom: 24 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginBottom: 8, textTransform: 'uppercase', marginLeft: 4 },
    input: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },
    cancelButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#F2F2F7' },
    cancelButtonText: { color: '#8E8E93', fontSize: 16, fontWeight: '600' },
    saveButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#007AFF' },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
