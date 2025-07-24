import axios from 'axios';
import { baseApiUrl, groupsApi, groupIdApi, groupMembersApi, groupInviteApi, groupJoinApi, groupJoinInvitationApi, groupLeaveApi, groupUpdateApi, groupDeleteApi, groupRemoveUserApi } from '../shared/Constants';
import { GroupModel, GroupMemberModel, GroupInvitationModel } from '../shared/Models';
import { handleApiError } from './useApi';

// API-Instanz mit Auth-Header
const createAuthenticatedRequest = () => {
    const userData = localStorage.getItem('user');
    const token = userData ? JSON.parse(userData).access_token : null;

    return {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    };
};

export const groupsApiService = {
    // Alle Gruppen des Users abrufen
    getUserGroups: async (): Promise<GroupModel[]> => {
        try {
            const response = await axios.get(`${baseApiUrl}${groupsApi}`, createAuthenticatedRequest());
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // Neue Gruppe erstellen
    createGroup: async (data: { name: string; description?: string; image?: File }): Promise<GroupModel> => {
        try {
            const requestData: { name: string; description?: string; image?: string } = {
                name: data.name,
                description: data.description
            };

            if (data.image) {
                // Convert image to base64
                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(data.image!);
                });
                requestData.image = base64;
            }

            const response = await axios.post(`${baseApiUrl}${groupsApi}`, requestData, createAuthenticatedRequest());
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // Gruppe bearbeiten
    updateGroup: async (groupId: number, data: { name: string; description?: string; image?: File }): Promise<GroupModel> => {
        try {
            const requestData: { name: string; description?: string; image?: string | null } = {
                name: data.name,
                description: data.description
            };

            if (data.image) {
                // Convert image to base64
                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(data.image!);
                });
                requestData.image = base64;
            } else if (data.image === undefined) {
                // Explicitly set to null to remove image
                requestData.image = null;
            }

            const response = await axios.put(`${baseApiUrl}${groupUpdateApi(groupId)}`, requestData, createAuthenticatedRequest());
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // Gruppe löschen
    deleteGroup: async (groupId: number): Promise<void> => {
        try {
            await axios.delete(`${baseApiUrl}${groupDeleteApi(groupId)}`, createAuthenticatedRequest());
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // Gruppenmitglieder abrufen
    getGroupMembers: async (groupId: number): Promise<GroupMemberModel[]> => {
        try {
            const response = await axios.get(`${baseApiUrl}${groupMembersApi(groupId)}`, createAuthenticatedRequest());
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // User per E-Mail zur Gruppe einladen
    inviteUserToGroup: async (groupId: number, data: GroupInvitationModel): Promise<{ message: string; inviteToken: string }> => {
        try {
            const response = await axios.post(`${baseApiUrl}${groupInviteApi(groupId)}`, { email: data.invitedEmail }, createAuthenticatedRequest());
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // Gruppe über Einladungscode beitreten
    joinGroupByCode: async (inviteCode: string): Promise<{ message: string; group: GroupModel }> => {
        try {
            const response = await axios.post(`${baseApiUrl}${groupJoinApi(inviteCode)}`, {}, createAuthenticatedRequest());
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // Gruppe über E-Mail-Token beitreten
    joinGroupByToken: async (inviteToken: string): Promise<{ message: string; group: GroupModel }> => {
        try {
            const response = await axios.post(`${baseApiUrl}${groupJoinInvitationApi(inviteToken)}`, {}, createAuthenticatedRequest());
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // Gruppe verlassen
    leaveGroup: async (groupId: number): Promise<{ message: string }> => {
        try {
            const response = await axios.post(`${baseApiUrl}${groupLeaveApi(groupId)}`, {}, createAuthenticatedRequest());
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // User aus Gruppe entfernen (nur für Admins)
    removeUserFromGroup: async (groupId: number, userId: number): Promise<{ message: string }> => {
        try {
            const response = await axios.post(`${baseApiUrl}${groupRemoveUserApi(groupId, userId)}`, {}, createAuthenticatedRequest());
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    }
};
