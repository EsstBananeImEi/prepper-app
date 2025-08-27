import { groupsApi, groupMembersApi, groupInviteApi, groupGenerateInviteTokenApi, groupInvitationsApi, groupRevokeInvitationApi, groupJoinApi, groupJoinInvitationApi, groupLeaveApi, groupUpdateApi, groupDeleteApi, groupRemoveUserApi } from '../shared/Constants';
import { GroupModel, GroupMemberModel, GroupInvitationModel, GroupPendingInvitationModel } from '../shared/Models';
import { handleApiError } from './useApi';
import { ImageCompressionUtils } from '../utils/imageCompressionUtils';
import { ImageCacheManager } from '../utils/imageCacheManager';
import createSecureApiClient from '../utils/secureApiClient';

// Shared secure API client (adds Authorization and handles refresh)
const api = createSecureApiClient();

export const groupsApiService = {
    // Alle Gruppen des Users abrufen
    getUserGroups: async (): Promise<GroupModel[]> => {
        try {
            const response = await api.get(groupsApi);
            const groups = response.data;

            // Load cached images for groups that have images
            const groupsWithCachedImages = groups.map((group: GroupModel) => {
                if (group.image) {
                    // Try to get cached image first
                    const cachedImage = ImageCacheManager.getCachedImage(group.id);
                    if (cachedImage) {
                        return { ...group, image: cachedImage };
                    } else {
                        // Cache the image from server response
                        ImageCacheManager.cacheImage(group.id, group.image);
                    }
                }
                return group;
            });

            return groupsWithCachedImages;
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
                // Compress and convert image to base64
                const compressionOptions = ImageCompressionUtils.getOptimalCompressionSettings(data.image.size);
                const compressedBase64 = await ImageCompressionUtils.compressToBase64(data.image, compressionOptions);
                requestData.image = compressedBase64;
            }

            const response = await api.post(groupsApi, requestData);
            const newGroup = response.data;

            // Cache the image if it exists
            if (newGroup.image) {
                ImageCacheManager.cacheImage(newGroup.id, newGroup.image);
            }

            return newGroup;
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
                // Compress and convert image to base64
                const compressionOptions = ImageCompressionUtils.getOptimalCompressionSettings(data.image.size);
                const compressedBase64 = await ImageCompressionUtils.compressToBase64(data.image, compressionOptions);
                requestData.image = compressedBase64;
            } else if (data.image === undefined) {
                // Explicitly set to null to remove image
                requestData.image = null;
            }

            const response = await api.put(groupUpdateApi(groupId), requestData);
            const updatedGroup = response.data;

            // Update cache
            if (updatedGroup.image) {
                ImageCacheManager.cacheImage(groupId, updatedGroup.image);
            } else {
                // Remove from cache if image was deleted
                ImageCacheManager.removeCachedImage(groupId);
            }

            return updatedGroup;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // Gruppe löschen
    deleteGroup: async (groupId: number): Promise<void> => {
        try {
            await api.delete(groupDeleteApi(groupId));
            // Remove from cache when group is deleted
            ImageCacheManager.removeCachedImage(groupId);
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // Gruppenmitglieder abrufen
    getGroupMembers: async (groupId: number): Promise<GroupMemberModel[]> => {
        try {
            const response = await api.get(groupMembersApi(groupId));
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // User per E-Mail zur Gruppe einladen
    inviteUserToGroup: async (groupId: number, data: GroupInvitationModel): Promise<{ message: string; inviteToken: string }> => {
        try {
            const response = await api.post(groupInviteApi(groupId), data);
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // ✅ NEU: Nur Invite-Token generieren (ohne E-Mail)
    generateInviteToken: async (groupId: number): Promise<{ message: string; inviteToken: string }> => {
        try {
            const response = await api.post(groupGenerateInviteTokenApi(groupId), {});
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // ✅ NEU: Ausstehende Einladungen einer Gruppe abrufen
    getGroupInvitations: async (groupId: number): Promise<{ invitations: GroupPendingInvitationModel[] }> => {
        try {
            const response = await api.get(groupInvitationsApi(groupId));
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // ✅ NEU: Einladung widerrufen
    revokeInvitation: async (groupId: number, token: string): Promise<{ message: string }> => {
        try {
            const response = await api.delete(groupRevokeInvitationApi(groupId, token));
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // Gruppe über Einladungscode beitreten
    joinGroupByCode: async (inviteCode: string): Promise<{ message: string; group: GroupModel }> => {
        try {
            const response = await api.post(groupJoinApi(inviteCode), {});
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // Gruppe über E-Mail-Token beitreten
    joinGroupByToken: async (inviteToken: string): Promise<{ message: string; group: GroupModel }> => {
        try {
            const response = await api.post(groupJoinInvitationApi(inviteToken), {});
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // Gruppe verlassen
    leaveGroup: async (groupId: number): Promise<{ message: string }> => {
        try {
            const response = await api.post(groupLeaveApi(groupId), {});
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    },

    // User aus Gruppe entfernen (nur für Admins)
    removeUserFromGroup: async (groupId: number, userId: number): Promise<{ message: string }> => {
        try {
            const response = await api.post(groupRemoveUserApi(groupId, userId), {});
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error, false));
        }
    }
};
