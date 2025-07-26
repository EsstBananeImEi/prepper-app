/**
 * Invite Token Management System
 * Verwaltet Einladungen zu Gruppen mit automatischem Beitritt nach Login/Registration
 */

import {
    baseApiUrl,
    groupValidateInvitationApi,
    groupJoinInvitationApi,
    buildApiUrl
} from '../shared/Constants';

export interface InviteToken {
    id: string;
    groupId: string;
    groupName: string;
    inviterId: string;
    inviterName: string;
    token: string;
    expiresAt: number;
    usedAt?: number;
    usedBy?: string;
    createdAt: number;
}

export interface PendingInvite {
    token: string;
    groupId: string;
    groupName: string;
    inviterName: string;
    expiresAt: number;
    persistent?: boolean; // Bleibt auch nach Registrierung bestehen
    email?: string; // Für Account-Aktivierung
}

export class InviteManager {
    private static readonly STORAGE_KEY = 'pending_invites';
    private static readonly TOKEN_EXPIRY = 48 * 60 * 60 * 1000; // 48 Stunden

    /**
     * Erstellt einen neuen Einladungstoken
     */
    static createInviteToken(groupId: string, groupName: string, inviterId: string, inviterName: string): string {
        const token = this.generateSecureToken();
        const invite: InviteToken = {
            id: this.generateId(),
            groupId,
            groupName,
            inviterId,
            inviterName,
            token,
            expiresAt: Date.now() + this.TOKEN_EXPIRY,
            createdAt: Date.now()
        };

        // Token im localStorage für Offline-Verfügbarkeit speichern
        this.storeInviteToken(invite);

        return token;
    }

    /**
     * Generiert eine sichere Einladungs-URL
     */
    static createInviteUrl(token: string, baseUrl?: string): string {
        const base = baseUrl || window.location.origin;
        // Entferne trailing slash von base und führenden slash von path, um doppelte slashes zu vermeiden
        const cleanBase = base.replace(/\/+$/, '');
        return `${cleanBase}/invite/${token}`;
    }

    /**
     * Speichert einen ausstehenden Invite für späteren Beitritt
     * Mit erweiterten Optionen für Account-Aktivierung
     */
    static storePendingInvite(
        token: string,
        groupId: string,
        groupName: string,
        inviterName: string,
        expiresAt: number,
        options?: {
            persistent?: boolean; // Für Registrierung + Aktivierung
            email?: string; // Für Account-Aktivierung
        }
    ): void {
        const pendingInvites = this.getPendingInvites();

        // Entferne bestehende Invites für die gleiche Gruppe
        const filteredInvites = pendingInvites.filter(invite => invite.groupId !== groupId);

        const newInvite: PendingInvite & { persistent?: boolean; email?: string } = {
            token,
            groupId,
            groupName,
            inviterName,
            expiresAt,
            persistent: options?.persistent || false,
            email: options?.email
        };

        filteredInvites.push(newInvite);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredInvites));

        console.log('Pending invite stored:', newInvite);
    }

    /**
     * Holt alle ausstehenden Invites
     */
    static getPendingInvites(): PendingInvite[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return [];

            const invites: PendingInvite[] = JSON.parse(stored);
            const now = Date.now();

            // Filtere abgelaufene Invites
            const validInvites = invites.filter(invite => invite.expiresAt > now);

            // Speichere nur gültige Invites zurück
            if (validInvites.length !== invites.length) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validInvites));
            }

            return validInvites;
        } catch (error) {
            console.warn('Fehler beim Laden der pending invites:', error);
            return [];
        }
    }

    /**
 * Verarbeitet alle ausstehenden Invites für einen User
 */
    static async processPendingInvites(userId: string, userEmail?: string): Promise<void> {
        const pendingInvites = this.getPendingInvites();

        if (pendingInvites.length === 0) {
            console.log('ℹ️ Keine ausstehenden Invites vorhanden');
            return;
        }

        console.log(`🚀 Verarbeite ${pendingInvites.length} ausstehende Invites für User ${userId}`);

        // ✅ KORRIGIERT: Token aus User-Objekt im localStorage lesen
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const authToken = user?.access_token;

        if (!authToken) {
            console.error('❌ Kein Access-Token gefunden - User muss eingeloggt sein');
            return;
        }

        console.log('🔑 Access-Token gefunden:', authToken ? 'Ja' : 'Nein');

        for (const invite of pendingInvites) {
            try {
                console.log(`🔄 Verarbeite Token ${invite.token}`);

                const response = await fetch(buildApiUrl(groupJoinInvitationApi(invite.token)), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`  // ✅ Korrekt aus User-Objekt
                    }
                });

                console.log(`📡 Response Status für Token ${invite.token}: ${response.status}`);

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Token ${invite.token} erfolgreich verarbeitet: "${data.group?.name}"`);
                    this.removePendingInvite(invite.token);
                } else if (response.status === 409) {
                    console.log(`ℹ️ Token ${invite.token}: Bereits Mitglied der Gruppe`);
                    this.removePendingInvite(invite.token);
                } else if (response.status === 404) {
                    console.warn(`❌ Token ${invite.token}: Nicht gefunden oder abgelaufen`);
                    this.removePendingInvite(invite.token);
                } else if (response.status === 422) {
                    console.error(`❌ Token ${invite.token}: Unprocessable Entity (422) - möglicherweise Token-Problem`);
                    const errorData = await response.text();
                    console.error('Error details:', errorData);

                    // Bei 422 Token behalten, da es ein Server-Problem sein könnte
                    if (!invite.persistent) {
                        this.removePendingInvite(invite.token);
                    }
                } else {
                    const error = await response.json().catch(() => ({ error: 'Backend-Fehler' }));
                    console.error(`❌ Token ${invite.token} fehlgeschlagen (${response.status}):`, error);

                    if (!invite.persistent) {
                        console.log(`🗑️ Entferne nicht-persistenten Token ${invite.token}`);
                        this.removePendingInvite(invite.token);
                    }
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`❌ Fehler beim Verarbeiten von Token ${invite.token}:`, errorMessage);

                // Bei Netzwerkfehlern Token behalten
                if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('Network')) {
                    console.log(`🗑️ Entferne fehlerhaften Token ${invite.token}`);
                    this.removePendingInvite(invite.token);
                }
            }
        }
    }

    /**
     * Löscht alle ausstehenden Invites
     */
    static clearPendingInvites(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('Alle ausstehenden Invites gelöscht');
    }

    /**
     * Löscht einen spezifischen ausstehenden Invite
     */
    static removePendingInvite(token: string): void {
        const pendingInvites = this.getPendingInvites();
        const filteredInvites = pendingInvites.filter(invite => invite.token !== token);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredInvites));
    }

    /**
     * Validiert einen Invite-Token (Backend-first für Email-Invites)
     */
    static async validateInviteToken(token: string): Promise<InviteToken | null> {
        try {
            // ✅ BACKEND-FIRST: Für Email-Invites muss das Backend die Quelle der Wahrheit sein
            console.log(`🔍 Validiere Token im Backend: ${buildApiUrl(groupValidateInvitationApi(token))}`);

            const response = await fetch(buildApiUrl(groupValidateInvitationApi(token)));

            console.log(`📡 Backend Response Status: ${response.status}`);

            if (response.ok) {
                const data = await response.json();
                console.log('📨 Backend Response Data:', data);

                if (data.valid) {
                    // Sichere Behandlung des expiresAt Datums
                    const expiresAt = data.expiresAt
                        ? new Date(data.expiresAt).getTime()
                        : Date.now() + (48 * 60 * 60 * 1000); // 48 Stunden Fallback

                    const inviteToken: InviteToken = {
                        id: `backend-${token}`,
                        token,
                        groupId: data.groupId.toString(),
                        groupName: data.groupName,
                        inviterId: data.inviterId?.toString() || 'backend-user',
                        inviterName: data.inviterName,
                        expiresAt,
                        createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now()
                    };

                    console.log('✅ Backend-Token erfolgreich validiert:', inviteToken);
                    return inviteToken;
                } else {
                    console.warn('❌ Backend sagt Token ist ungültig:', data);
                    return null;
                }
            } else if (response.status === 404) {
                console.warn('❌ Token nicht gefunden oder abgelaufen (404)');
                return null;
            } else if (response.status >= 500) {
                console.error(`❌ Backend-Fehler (${response.status}) - versuche localStorage-Fallback`);
                // Nur bei Server-Fehlern lokalen Fallback versuchen
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.warn(`❌ Backend Response nicht OK (${response.status}):`, errorData);
                return null; // Bei 4xx Fehlern kein Fallback
            }

            // ⚠️ FALLBACK: Nur bei Server-Fehlern oder wenn lokaler Token existiert
            console.log('🔄 Backend nicht verfügbar - prüfe lokalen Fallback');
            const storedInvites = this.getStoredInviteTokens();
            const invite = storedInvites.find(inv => inv.token === token);

            if (!invite) {
                console.warn('❌ Token weder im Backend noch lokal gefunden:', token);
                return null;
            }

            if (invite.expiresAt < Date.now()) {
                console.warn('❌ Lokaler Token ist abgelaufen:', token);
                return null;
            }

            if (invite.usedAt) {
                console.warn('❌ Lokaler Token wurde bereits verwendet:', token);
                return null;
            }

            console.log('✅ Fallback zu lokalem Token erfolgreich');
            return invite;
        } catch (error) {
            console.error('❌ Fehler beim Validieren des Invite-Tokens:', error);

            // Bei Netzwerkfehlern lokalen Fallback versuchen
            console.log('🔄 Netzwerkfehler - versuche lokalen Fallback');
            const storedInvites = this.getStoredInviteTokens();
            const invite = storedInvites.find(inv => inv.token === token);

            if (invite && invite.expiresAt > Date.now() && !invite.usedAt) {
                console.log('✅ Lokaler Fallback erfolgreich');
                return invite;
            }

            console.warn('❌ Kein gültiger lokaler Token verfügbar');
            return null;
        }
    }

    /**
 * Tritt einer Gruppe über einen Invite-Token bei
 */
    static async joinGroupViaInvite(token: string, userId: string): Promise<boolean> {
        try {
            // ✅ KORRIGIERT: Token aus User-Objekt lesen
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const authToken = user?.access_token;

            if (!authToken) {
                console.error('❌ Kein Access-Token gefunden - User muss eingeloggt sein');
                throw new Error('No access token available');
            }

            console.log(`🔄 Backend-Gruppenbeitritt für Token: ${token}`);

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(buildApiUrl(groupJoinInvitationApi(token)), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`  // ✅ Korrekt aus User-Objekt
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                console.log(`📡 Response Status: ${response.status}`);

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Backend-Gruppenbeitritt erfolgreich: "${data.group?.name}"`);
                    this.removePendingInvite(token);
                    return true;
                } else if (response.status === 422) {
                    console.error('❌ 422 Unprocessable Entity - Token oder Request Problem');
                    const errorText = await response.text();
                    console.error('Error details:', errorText);
                    throw new Error(`422 Unprocessable Entity: ${errorText}`);
                } else if (response.status === 404) {
                    console.warn('❌ Token nicht gefunden (404)');
                    this.removePendingInvite(token);
                    throw new Error('Token nicht gefunden');
                } else if (response.status === 409) {
                    console.warn('❌ Bereits Mitglied der Gruppe (409)');
                    this.removePendingInvite(token);
                    return true;
                } else {
                    const error = await response.json().catch(() => ({ error: 'Backend-Fehler' }));
                    console.warn(`❌ Backend-Gruppenbeitritt fehlgeschlagen (${response.status}):`, error);
                    throw new Error(error.error || 'Backend-Fehler beim Gruppenbeitritt');
                }
            } catch (fetchError: unknown) {
                const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
                console.warn('⚠️ Backend-API Fehler:', errorMessage);
                throw fetchError;
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('❌ Fehler beim Gruppenbeitritt:', errorMessage);
            throw error;
        }
    }

    /**
     * Verknüpft ausstehende Invites mit einer Email-Adresse
     * Wird nach der Registrierung aufgerufen
     */
    static linkPendingInvitesToEmail(email: string): void {
        const pendingInvites = this.getPendingInvites();
        const persistentInvites = pendingInvites.filter(invite => invite.persistent);

        if (persistentInvites.length > 0) {
            // Verknüpfe persistente Invites mit der Email
            const updatedInvites = pendingInvites.map(invite => ({
                ...invite,
                email: invite.persistent ? email : invite.email
            }));

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedInvites));
            console.log(`${persistentInvites.length} persistente Invites mit Email ${email} verknüpft`);
        }
    }

    /**
     * Debug-Funktion: Zeigt alle pending Invites in der Console
     */
    static debugPendingInvites(): void {
        const pendingInvites = this.getPendingInvites();
        console.log('🔍 Aktuelle pending Invites:', pendingInvites);

        if (pendingInvites.length === 0) {
            console.log('✅ Keine pending Invites vorhanden');
        } else {
            pendingInvites.forEach((invite, index) => {
                const expiredText = invite.expiresAt < Date.now() ? ' (ABGELAUFEN)' : '';
                console.log(`${index + 1}. ${invite.groupName} - Token: ${invite.token.substring(0, 10)}...${expiredText}`);
            });
        }
    }

    /**
     * Debug-Funktion: Löscht alle hängenden Invites
     */
    static forceCleanPendingInvites(): void {
        const beforeCount = this.getPendingInvites().length;
        this.clearPendingInvites();
        console.log(`🗑️ ${beforeCount} pending Invites zwangsweise gelöscht`);
    }

    /**
     * Markiert einen Token als verwendet
     */
    private static async markTokenAsUsed(token: string, userId: string): Promise<void> {
        const storedInvites = this.getStoredInviteTokens();
        const invite = storedInvites.find(inv => inv.token === token);

        if (invite) {
            invite.usedAt = Date.now();
            invite.usedBy = userId;
            this.updateStoredInviteTokens(storedInvites);
        }
    }

    /**
     * Generiert einen sicheren Token
     */
    private static generateSecureToken(): string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Generiert eine eindeutige ID
     */
    private static generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Speichert einen Invite-Token
     */
    private static storeInviteToken(invite: InviteToken): void {
        const storedInvites = this.getStoredInviteTokens();
        storedInvites.push(invite);
        this.updateStoredInviteTokens(storedInvites);
    }

    /**
     * Holt gespeicherte Invite-Tokens
     */
    private static getStoredInviteTokens(): InviteToken[] {
        try {
            const stored = localStorage.getItem('invite_tokens');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Fehler beim Laden der Invite-Tokens:', error);
            return [];
        }
    }

    /**
     * Aktualisiert gespeicherte Invite-Tokens
     */
    private static updateStoredInviteTokens(tokens: InviteToken[]): void {
        localStorage.setItem('invite_tokens', JSON.stringify(tokens));
    }
}
