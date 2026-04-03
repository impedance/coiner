import { useState, useCallback, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { artifactRepository } from '../db/repositories/ArtifactRepository';
import { Artifact } from '../types';

const ARTIFACTS_DIR = Paths.document + '/artifacts/';

export function useArtifacts(goalId?: string) {
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [loading, setLoading] = useState(true);

    const ensureArtifactsDir = async () => {
        const dir = new Directory(ARTIFACTS_DIR);
        await dir.create({ intermediates: true });
    };

    const refresh = useCallback(async () => {
        setLoading(true);
        await ensureArtifactsDir();
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
        const localUri = ARTIFACTS_DIR + fileName;

        // Copy image to app directory using File API
        const sourceFile = new File(pickedImage.uri);
        const destFile = new File(localUri);
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
        if (artifact?.image_uri) {
            try {
                const file = new File(artifact.image_uri);
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
