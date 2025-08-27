import { useState, useEffect } from 'react';
import { useStore } from '../store/Store';
import { baseApiUrl } from '../shared/Constants';
import { adminApi } from '../utils/secureApiClient';
type AdminValidationResponse = {
    isAdmin: boolean;
    isValid?: boolean;
    user?: unknown;
};

interface AdminValidationResult {
    isAdmin: boolean;
    isValidating: boolean;
    error?: string;
}

interface ServerAdminValidation {
    isValid: boolean;
    isAdmin: boolean;
    user?: {
        id: number;
        email: string;
        username: string;
        isAdmin: boolean;
    };
}

export const useAdminValidation = (): AdminValidationResult => {
    const { store } = useStore();
    const [result, setResult] = useState<AdminValidationResult>({
        isAdmin: false,
        isValidating: true
    });

    useEffect(() => {
        const validateAdminStatus = async () => {
            setResult(prev => ({ ...prev, isValidating: true, error: undefined }));

            // If no user or token, definitely not admin
            if (!store.user?.access_token) {
                setResult({
                    isAdmin: false,
                    isValidating: false,
                    error: 'Nicht angemeldet'
                });
                return;
            }

            try {
                const validation = (await adminApi.validateAdmin()) as AdminValidationResponse;
                setResult({
                    isAdmin: !!validation.isAdmin,
                    isValidating: false
                });
            } catch (error) {
                console.error('Admin validation error:', error);

                // Auf Server-Fehler: Deny admin access for security
                setResult({
                    isAdmin: false,
                    isValidating: false,
                    error: 'Server-Validierung fehlgeschlagen'
                });
            }
        };

        validateAdminStatus();
    }, [store.user?.access_token]);

    return result;
};

// Utility function for components that need immediate admin check without hook
export const validateAdminSync = async (_token: string): Promise<boolean> => {
    try {
        const result = (await adminApi.validateAdmin()) as AdminValidationResponse;
        return !!result.isAdmin;
    } catch (error) {
        console.error('Sync admin validation failed:', error);
        return false;
    }
};
