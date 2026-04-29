import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useBehavior } from '../../src/hooks/useBehavior';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Colors, Typography, Layout } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import * as Haptics from 'expo-haptics';

export default function PracticesScreen() {
    const { definitions, loading, createDefinition } = useBehavior();
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const router = useRouter();

    const handleCreate = async () => {
        if (!title || !code) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        try {
            await createDefinition(title, code);
            setModalVisible(false);
            setTitle('');
            setCode('');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
            Alert.alert('Error', 'Code must be unique.');
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Practice Library</Text>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionDescription}>
                    Define behavioral norms for your growth cycles. System practices are non-negotiable foundations.
                </Text>

                {definitions.map(def => (
                    <GlassCard key={def.id} style={styles.practiceCard}>
                        <View style={[styles.practiceIcon, { backgroundColor: def.is_system ? 'rgba(255,255,255,0.05)' : 'hsla(210, 100%, 50%, 0.1)' }]}>
                            <Ionicons 
                                name={def.is_system ? "shield-checkmark" : "flash-outline"} 
                                size={22} 
                                color={def.is_system ? Colors.textSecondary : Colors.primary} 
                            />
                        </View>
                        <View style={styles.practiceText}>
                            <Text style={styles.practiceTitle}>{def.title}</Text>
                            <Text style={styles.practiceCode}>{def.code.toUpperCase()}</Text>
                        </View>
                        {def.is_system && (
                            <View style={styles.systemBadge}>
                                <Text style={styles.systemBadgeText}>CORE</Text>
                            </View>
                        )}
                    </GlassCard>
                ))}
            </ScrollView>

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={24} color="#FFFFFF" />
                <Text style={styles.fabText}>New Practice</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
                    <GlassCard style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Practice</Text>
                        
                        <Text style={styles.inputLabel}>Title</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="e.g. Daily Reserve Check"
                            placeholderTextColor={Colors.textSecondary}
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.inputLabel}>Short Code</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="e.g. RESERVE_CHECK"
                            placeholderTextColor={Colors.textSecondary}
                            value={code}
                            onChangeText={setCode}
                            autoCapitalize="characters"
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={handleCreate}>
                            <Text style={styles.saveButtonText}>Create Practice</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </GlassCard>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, marginBottom: 12 },
    backBtn: { width: 40, marginLeft: -8 },
    headerTitle: { ...Typography.h2, flex: 1 },
    scroll: { flex: 1 },
    content: { padding: 24, paddingBottom: 100, width: '100%', maxWidth: Layout.MAX_WIDTH, alignSelf: 'center' },
    sectionDescription: { ...Typography.body, color: Colors.textSecondary, marginBottom: 32, lineHeight: 22 },
    practiceCard: { padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderRadius: 24 },
    practiceIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    practiceText: { flex: 1, marginLeft: 16 },
    practiceTitle: { ...Typography.bodyBold, fontSize: 17 },
    practiceCode: { ...Typography.small, color: Colors.textSecondary, marginTop: 2, fontWeight: '700', letterSpacing: 1 },
    systemBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    systemBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary },
    fab: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 30, gap: 10, elevation: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 },
    fabText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject },
    modalContent: { width: '85%', maxWidth: 340, padding: 24, borderRadius: 32 },
    modalTitle: { ...Typography.h3, marginBottom: 24, textAlign: 'center' },
    inputLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4 },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 18, fontSize: 16, color: Colors.text, marginBottom: 20, borderWidth: 1, borderColor: Colors.glassBorder },
    saveButton: { backgroundColor: Colors.primary, padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 8 },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
    cancelButton: { padding: 16, alignItems: 'center', marginTop: 4 },
    cancelButtonText: { ...Typography.bodyMedium, color: Colors.textSecondary },
});
