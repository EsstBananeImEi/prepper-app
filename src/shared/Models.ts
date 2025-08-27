export interface UserModel {
    id: number | null;
    email: string;
    username: string | null;
    password: string | null;
    access_token: string | null;
    refresh_token: string | null;
    image: string | null;
    persons: number | null;
    isAdmin?: boolean;
    isManager?: boolean;
    groups?: string[];
}

export interface GroupModel {
    id: number;
    name: string;
    description?: string;
    image?: string;
    role: 'admin' | 'member';
    memberCount: number;
    inviteCode: string;
    isCreator: boolean;
    createdAt?: string;
}

export interface GroupMemberModel {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'member';
    joinedAt?: string;
}

export interface GroupInvitationModel {
    groupId: number;
    invitedEmail: string;
    inviteToken?: string;  // Neues Token-System
    inviteUrl?: string;    // Vollständige URL für Email-Templates
}

export interface GroupPendingInvitationModel {
    id: number;
    token: string;
    invitedEmail?: string;
    inviterName: string;
    createdAt: string;
    expiresAt: string;
    status: 'pending' | 'used' | 'expired';
}