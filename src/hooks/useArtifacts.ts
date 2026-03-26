import { useState, useCallback, useEffect } from 'react';
import { artifactRepository } from '../db/repositories/ArtifactRepository';
import { Artifact } from '../types';

export function useArtifacts(goalId?: string) {
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
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

    const deleteArtifact = async (id: string) => {
        await artifactRepository.delete(id);
        await refresh();
    };

    return { artifacts, loading, addArtifact, deleteArtifact, refresh };
}
