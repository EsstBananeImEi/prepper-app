/**
 * Invite Token Management System
 * Verwaltet Einladungen zu Gruppen mit automatischem Beitritt nach Login/Registration
 */

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
}

export class InviteManager {
    private static readonly STORAGE_KEY = 'pending_invites';
    private static readonly TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 Tage

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
        return `${base}/invite/${token}`;
    }

    /**
     * Speichert einen ausstehenden Invite für späteren Beitritt
     */
    static storePendingInvite(token: string, groupId: string, groupName: string, inviterName: string, expiresAt: number): void {
        const pendingInvites = this.getPendingInvites();

        // Entferne bestehende Invites für die gleiche Gruppe
        const filteredInvites = pendingInvites.filter(invite => invite.groupId !== groupId);

        const newInvite: PendingInvite = {
            token,
            groupId,
            groupName,
            inviterName,
            expiresAt
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
     * Verarbeitet ausstehende Invites nach erfolgreichem Login
     */
    static async processPendingInvites(userId: string): Promise<void> {
        const pendingInvites = this.getPendingInvites();

        if (pendingInvites.length === 0) {
            console.log('Keine ausstehenden Invites vorhanden');
            return;
        }

        console.log(`Verarbeite ${pendingInvites.length} ausstehende Invites für User ${userId}`);

        for (const invite of pendingInvites) {
            try {
                await this.joinGroupViaInvite(invite.token, userId);
                console.log(`✅ Erfolgreich Gruppe ${invite.groupName} beigetreten`);
            } catch (error) {
                console.error(`❌ Fehler beim Beitritt zu Gruppe ${invite.groupName}:`, error);
            }
        }

        // Alle ausstehenden Invites löschen
        this.clearPendingInvites();
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
     * Validiert einen Invite-Token
     */
    static async validateInviteToken(token: string): Promise<InviteToken | null> {
        try {
            // Hier würde normalerweise eine API-Anfrage stattfinden
            // Für Demo verwenden wir localStorage
            const storedInvites = this.getStoredInviteTokens();
            const invite = storedInvites.find(inv => inv.token === token);

            if (!invite) {
                console.warn('Invite token nicht gefunden:', token);
                return null;
            }

            if (invite.expiresAt < Date.now()) {
                console.warn('Invite token ist abgelaufen:', token);
                return null;
            }

            if (invite.usedAt) {
                console.warn('Invite token wurde bereits verwendet:', token);
                return null;
            }

            return invite;
        } catch (error) {
            console.error('Fehler beim Validieren des Invite-Tokens:', error);
            return null;
        }
    }

    /**
     * Tritt einer Gruppe über einen Invite-Token bei
     */
    static async joinGroupViaInvite(token: string, userId: string): Promise<boolean> {
        try {
            const invite = await this.validateInviteToken(token);

            if (!invite) {
                throw new Error('Ungültiger oder abgelaufener Invite-Token');
            }

            // Hier würde normalerweise eine API-Anfrage zum Gruppenbeitritt stattfinden
            // Für Demo simulieren wir das
            console.log(`User ${userId} tritt Gruppe ${invite.groupName} (${invite.groupId}) bei`);

            // Markiere Token als verwendet
            await this.markTokenAsUsed(token, userId);

            // Entferne aus pending invites
            this.removePendingInvite(token);

            return true;
        } catch (error) {
            console.error('Fehler beim Gruppenbeitritt:', error);
            throw error;
        }
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
