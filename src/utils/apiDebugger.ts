
/**
 * API Debugging and Monitoring Utilities
 */
import i18n from '../i18n';

export interface ApiRequestLog {
    timestamp: string;
    method: string;
    url: string;
    status?: number;
    duration?: number;
    error?: string;
    requestData?: unknown;
    responseData?: unknown;
    requestHeaders?: Record<string, unknown>;
    responseHeaders?: Record<string, unknown>;
}

class ApiDebugger {
    private static instance: ApiDebugger;
    private logs: ApiRequestLog[] = [];
    private maxLogs = 100;

    static getInstance(): ApiDebugger {
        if (!ApiDebugger.instance) {
            ApiDebugger.instance = new ApiDebugger();
        }
        return ApiDebugger.instance;
    }

    logRequest(request: ApiRequestLog): void {
        this.logs.unshift({
            ...request,
            timestamp: new Date().toISOString()
        });

        // Keep only the latest logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            const icon = request.error ? '❌' : '✅';
            const duration = request.duration ? ` (${request.duration}ms)` : '';
            console.log(`${icon} API ${request.method} ${request.url}${duration}`, {
                status: request.status,
                error: request.error,
                requestData: request.requestData,
                responseData: request.responseData
            });
        }
    }

    getRecentLogs(): ApiRequestLog[] {
        return [...this.logs];
    }

    getErrorLogs(): ApiRequestLog[] {
        return this.logs.filter(log => log.error);
    }

    clearLogs(): void {
        this.logs = [];
    }

    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }

    getHealthStatus(): {
        totalRequests: number;
        errorCount: number;
        errorRate: number;
        lastHourRequests: number;
    } {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentLogs = this.logs.filter(log => new Date(log.timestamp) > oneHourAgo);
        const errorLogs = recentLogs.filter(log => log.error);

        return {
            totalRequests: this.logs.length,
            errorCount: errorLogs.length,
            errorRate: this.logs.length > 0 ? (errorLogs.length / this.logs.length) * 100 : 0,
            lastHourRequests: recentLogs.length
        };
    }
}

export const apiDebugger = ApiDebugger.getInstance();

// Define common error interface
interface ApiError {
    response?: {
        status: number;
        data?: { error?: string };
    };
    config?: {
        url?: string;
        method?: string;
    };
}

/**
 * Analyzes common API errors and provides suggestions
 */
export function analyzeApiError(error: ApiError): {
    category: string;
    suggestion: string;
    severity: 'low' | 'medium' | 'high';
} {
    const t = (key: string) => i18n.t(key);
    if (!error.response) {
        return {
            category: t('utils.api.category.network'),
            suggestion: t('utils.api.suggestion.network'),
            severity: 'high'
        };
    }

    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
        case 400:
            if (data?.error?.includes('image') || data?.error?.includes('Base64')) {
                return {
                    category: t('utils.api.category.imageData'),
                    suggestion: t('utils.api.suggestion.imageData'),
                    severity: 'medium'
                };
            }
            return {
                category: t('utils.api.category.badRequest'),
                suggestion: t('utils.api.suggestion.badRequest'),
                severity: 'medium'
            };

        case 401:
            return {
                category: t('utils.api.category.auth'),
                suggestion: t('utils.api.suggestion.auth'),
                severity: 'high'
            };

        case 403:
            return {
                category: t('utils.api.category.permission'),
                suggestion: t('utils.api.suggestion.permission'),
                severity: 'medium'
            };

        case 404:
            return {
                category: t('utils.api.category.notFound'),
                suggestion: t('utils.api.suggestion.notFound'),
                severity: 'medium'
            };

        case 422:
            return {
                category: t('utils.api.category.validation'),
                suggestion: t('utils.api.suggestion.validation'),
                severity: 'medium'
            };

        case 500:
            return {
                category: t('utils.api.category.server'),
                suggestion: t('utils.api.suggestion.server'),
                severity: 'high'
            };

        default:
            return {
                category: t('utils.api.category.unknown'),
                suggestion: t('utils.api.suggestion.unknown'),
                severity: 'medium'
            };
    }
}

/**
 * Enhanced error message formatting
 */
export function formatApiError(error: {
    response?: {
        status?: number;
        data?: unknown;
    };
    config?: {
        url?: string;
        method?: string;
    };
}): string {
    const t = (key: string) => i18n.t(key);
    // Convert to ApiError format for analysis
    const apiError: ApiError = {
        response: error.response?.status ? {
            status: error.response.status,
            data: error.response.data as { error?: string } | undefined
        } : undefined,
        config: error.config
    };

    const analysis = analyzeApiError(apiError);

    let message = analysis.suggestion;

    if (process.env.NODE_ENV === 'development') {
        const status = error.response?.status;
        const url = error.config?.url;
        const method = error.config?.method?.toUpperCase();

        message += `\n\n[Debug] ${method} ${url} → ${status}`;

        if (error.response?.data) {
            message += `\n${t('utils.api.debug.serverResponse')} ${JSON.stringify(error.response.data, null, 2)}`;
        }
    }

    return message;
}

/**
 * Creates performance timer for API requests
 */
export function createApiTimer(method: string, url: string) {
    const startTime = Date.now();

    return {
        finish: (status?: number, error?: string) => {
            const duration = Date.now() - startTime;

            apiDebugger.logRequest({
                timestamp: new Date().toISOString(),
                method: method.toUpperCase(),
                url,
                status,
                duration,
                error
            });

            return duration;
        }
    };
}
