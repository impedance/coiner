import { useState, useEffect, useCallback } from 'react';
import { settingsRepository } from '../db/repositories/SettingsRepository';

export function useSettings() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        const data = await settingsRepository.getAll();
        const settingsMap: Record<string, string> = {};
        data.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        setSettings(settingsMap);
        setLoading(false);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const updateSetting = async (key: string, value: string) => {
        await settingsRepository.set(key, value);
        await refresh();
    };

    const getSetting = (key: string, defaultValue: string) => {
        return settings[key] || defaultValue;
    };

    return {
        settings,
        loading,
        updateSetting,
        getSetting,
        refresh,
    };
}
