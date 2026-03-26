import { useState, useEffect, useCallback } from 'react';
import { cycleRepository } from '../db/repositories/CycleRepository';
import { practiceRepository } from '../db/repositories/PracticeRepository';
import { Cycle, PracticeDefinition, PracticeCheckin } from '../types';

export function useBehavior() {
    const [activeCycle, setActiveCycle] = useState<Cycle | null>(null);
    const [definitions, setDefinitions] = useState<PracticeDefinition[]>([]);
    const [checkins, setCheckins] = useState<PracticeCheckin[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        const [cycle, defs] = await Promise.all([
            cycleRepository.getActiveCycle(),
            practiceRepository.getDefinitions(),
        ]);

        setActiveCycle(cycle);
        setDefinitions(defs);

        if (cycle) {
            const today = new Date().toISOString().split('T')[0];
            const dayCheckins = await Promise.all(
                defs.map(d => practiceRepository.getCheckin(d.id, today, cycle.id))
            );
            setCheckins(dayCheckins.filter((c): c is PracticeCheckin => c !== null));
        } else {
            setCheckins([]);
        }
        
        setLoading(false);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const startCycle = async (title: string, days: number, practiceIds: string[]) => {
        const now = new Date();
        const end = new Date();
        end.setDate(now.getDate() + days);

        await cycleRepository.startCycle({
            title,
            duration_days: days,
            start_date: now.toISOString(),
            end_date: end.toISOString(),
            mode: 'soft',
            status: 'active',
            target_level: 'minimum',
        }, practiceIds);
        
        await refresh();
    };

    const toggleCheckin = async (definitionId: string, status: 'done' | 'missed') => {
        const today = new Date().toISOString().split('T')[0];
        await practiceRepository.upsertCheckin({
            practice_definition_id: definitionId,
            checkin_date: today,
            status: status,
            cycle_id: activeCycle?.id,
        });
        await refresh();
    };

    return {
        activeCycle,
        definitions,
        checkins,
        loading,
        startCycle,
        toggleCheckin,
        refresh,
    };
}
