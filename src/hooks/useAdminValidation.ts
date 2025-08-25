import { useState, useEffect } from 'react';
import { useStore } from '../store/Store';
import { baseApiUrl } from '../shared/Constants';

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
                const response = await fetch(`${baseApiUrl}/auth/validate-admin`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${store.user.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const validation: ServerAdminValidation = await response.json();
                    setResult({
                        isAdmin: validation.isAdmin,
                        isValidating: false
                    });
                } else if (response.status === 401) {
                    // Token invalid/expired
                    setResult({
                        isAdmin: false,
                        isValidating: false,
                        error: 'Sitzung abgelaufen'
                    });

                    // Clear invalid token
                    localStorage.removeItem('user');
                } else if (response.status === 403) {
                    // Valid token but not admin
                    setResult({
                        isAdmin: false,
                        isValidating: false,
                        error: 'Keine Admin-Berechtigung'
                    });
                } else {
                    throw new Error(`Admin validation failed: ${response.status}`);
                }
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
export const validateAdminSync = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${baseApiUrl}/auth/validate-admin`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result: ServerAdminValidation = await response.json();
            return result.isAdmin;
        }
        return false;
    } catch (error) {
        console.error('Sync admin validation failed:', error);
        return false;
    }
};
