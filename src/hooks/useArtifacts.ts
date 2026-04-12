import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { artifactRepository } from '../db/repositories/ArtifactRepository';
import { Artifact } from '../types';

// Lazy-load: these modules are native-only and crash on web at import time
let ImagePicker: typeof import('expo-image-picker') | null = null;
let FSPaths: { document: string } | null = null;
let FSDirectory: (new (path: string) => { create: (opts?: any) => Promise<void> }) | null = null;
let FSFile: (new (uri: string) => { copy: (dest: any) => Promise<void>; exists: boolean; delete: () => Promise<void> }) | null = null;

if (Platform.OS !== 'web') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ip = require('expo-image-picker');
    ImagePicker = ip;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('expo-file-system');
    FSPaths = fs.Paths;
    FSDirectory = fs.Directory;
    FSFile = fs.File;
}

const getArtifactsDir = (): string => {
    if (!FSPaths) return '';
    return FSPaths.document + '/artifacts/';
};

export function useArtifacts(goalId?: string) {
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [loading, setLoading] = useState(true);

    const ensureArtifactsDir = async () => {
        if (Platform.OS === 'web' || !FSDirectory) return;
        const dir = new FSDirectory(getArtifactsDir());
        await dir.create({ intermediates: true });
    };

    const refresh = useCallback(async () => {
        setLoading(true);
        if (Platform.OS !== 'web') {
            await ensureArtifactsDir();
        }
        const data = goalId
            ? await artifactRepository.getByGoalId(goalId)
            : await artifactRepository.getAll();
        setArtifacts(data);
        setLoading(false);
    }, [goalId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addArtifact = async (artifact: Partial<Artifact>) => {
        const id = await artifactRepository.create({
            ...artifact,
            goal_id: goalId || artifact.goal_id,
        });
        await refresh();
        return id;
    };

    const addArtifactWithImage = async (title: string, description?: string) => {
        if (Platform.OS === 'web' || !ImagePicker || !FSFile) {
            // On web, just save the artifact without an image
            return addArtifact({
                goal_id: goalId,
                title,
                description,
                unlock_rule_type: 'manual',
            });
        }

        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Permission to access media library was denied');
        }

        // Pick image
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return null;
        }

        const pickedImage = result.assets[0];
        const fileName = `${Date.now()}_${pickedImage.fileName || 'image.jpg'}`;
        const localUri = getArtifactsDir() + fileName;

        // Copy image to app directory using File API
        const sourceFile = new FSFile(pickedImage.uri);
        const destFile = new FSFile(localUri);
        await sourceFile.copy(destFile);

        // Save to database
        const id = await artifactRepository.create({
            goal_id: goalId,
            title,
            description,
            image_uri: localUri,
            unlock_rule_type: 'manual',
        });

        await refresh();
        return id;
    };

    const deleteArtifact = async (id: string) => {
        const artifact = artifacts.find(a => a.id === id);
        if (artifact?.image_uri && Platform.OS !== 'web' && FSFile) {
            try {
                const file = new FSFile(artifact.image_uri);
                if (file.exists) {
                    await file.delete();
                }
            } catch (e) {
                // Ignore errors if file doesn't exist
            }
        }
        await artifactRepository.delete(id);
        await refresh();
    };

    return { artifacts, loading, addArtifact, addArtifactWithImage, deleteArtifact, refresh };
}
