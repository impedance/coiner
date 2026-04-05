import { useState, useEffect, useCallback, useMemo } from 'react';
import { cycleRepository } from '../db/repositories/CycleRepository';
import { practiceRepository } from '../db/repositories/PracticeRepository';
import { Cycle, PracticeDefinition, PracticeCheckin } from '../types';

export function useBehavior() {
    const [activeCycle, setActiveCycle] = useState<Cycle | null>(null);
    const [definitions, setDefinitions] = useState<PracticeDefinition[]>([]);
    const [checkins, setCheckins] = useState<PracticeCheckin[]>([]);
    const [allCycleCheckins, setAllCycleCheckins] = useState<PracticeCheckin[]>([]);
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

            // Get all checkins for this cycle for streak calculation
            const cycleCheckins = await practiceRepository.getCheckinsForPeriod(
                cycle.start_date.split('T')[0],
                today,
                cycle.id
            );
            setAllCycleCheckins(cycleCheckins);
        } else {
            setCheckins([]);
            setAllCycleCheckins([]);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // Calculate current streak based on consecutive days with all practices completed
    const streak = useMemo(() => {
        if (!activeCycle || allCycleCheckins.length === 0) return 0;

        const today = new Date().toISOString().split('T')[0];
        const checkinsByDate = new Map<string, PracticeCheckin[]>();

        // Group checkins by date
        for (const checkin of allCycleCheckins) {
            const existing = checkinsByDate.get(checkin.checkin_date) || [];
            existing.push(checkin);
            checkinsByDate.set(checkin.checkin_date, existing);
        }

        // Count consecutive days from today backwards
        let currentStreak = 0;
        const currentDate = new Date();

        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayCheckins = checkinsByDate.get(dateStr) || [];

            // Check if all practices for this day are done (min level achieved)
            const allDone = dayCheckins.length > 0 && dayCheckins.every(c => c.status !== 'missed');

            if (allDone) {
                currentStreak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (dateStr === today && dayCheckins.length === 0) {
                // Today has no checkins yet, skip to yesterday
                currentDate.setDate(currentDate.getDate() - 1);
                continue;
            } else {
                break;
            }
        }

        return currentStreak;
    }, [activeCycle, allCycleCheckins]);

    const startCycle = async (title: string, days: number, practiceIds: string[], mode: 'soft' | 'hard' = 'soft', targetLevel: 'minimum' | 'target' | 'hero' = 'minimum') => {
        const now = new Date();
        const end = new Date();
        end.setDate(now.getDate() + days);

        await cycleRepository.startCycle({
            title,
            duration_days: days,
            start_date: now.toISOString(),
            end_date: end.toISOString(),
            mode,
            status: 'active',
            target_level: targetLevel,
        }, practiceIds);

        await refresh();
    };

    const setCheckin = async (definitionId: string, status: 'missed' | 'minimum' | 'optimum' | 'maximum') => {
        const today = new Date().toISOString().split('T')[0];
        await practiceRepository.upsertCheckin({
            practice_definition_id: definitionId,
            checkin_date: today,
            status: status,
            cycle_id: activeCycle?.id,
        });
        await refresh();
    };

    const completeCycle = async (status: 'completed' | 'failed') => {
        if (!activeCycle) return;
        await cycleRepository.updateStatus(activeCycle.id, status);
        await refresh();
    };

    const createDefinition = async (title: string, code: string) => {
        await practiceRepository.createDefinition({
            title,
            code,
            scope: 'daily',
            is_system: false,
        });
        await refresh();
    };

    return {
        activeCycle,
        definitions,
        checkins,
        streak,
        loading,
        startCycle,
        setCheckin,
        createDefinition,
        completeCycle,
        refresh,
    };
}
