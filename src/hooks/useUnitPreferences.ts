import { useEffect, useState } from 'react';

export type UnitSystem = 'metric' | 'imperial' | 'custom';

export interface UnitPreferences {
    unitSystem: UnitSystem;
    useShortUnits: boolean;
}

// Read prefs from localStorage with sane defaults
const readPrefs = (): UnitPreferences => ({
    unitSystem: (localStorage.getItem('unitSystem') as UnitSystem) || 'metric',
    useShortUnits: localStorage.getItem('useShortUnits') === 'true',
});

export function useUnitPreferences(): UnitPreferences {
    const [prefs, setPrefs] = useState<UnitPreferences>(() => readPrefs());

    useEffect(() => {
        const onChange = () => setPrefs(readPrefs());
        // Custom event from Settings page
        window.addEventListener('unitPrefsChanged', onChange as EventListener);
        // Sync across tabs/windows as well
        window.addEventListener('storage', onChange as EventListener);
        return () => {
            window.removeEventListener('unitPrefsChanged', onChange as EventListener);
            window.removeEventListener('storage', onChange as EventListener);
        };
    }, []);

    return prefs;
}
