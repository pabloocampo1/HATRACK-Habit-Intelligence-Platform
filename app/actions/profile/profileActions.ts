"use server";

import {
  getProfilePageData,
  updateDisplayName,
  deleteAccount,
  type ProfilePageData,
} from "@/services/profile/profileService";

// ProfilePageData is intentionally NOT re-exported from here.
// Import it directly from "@/services/profile/profileService" in client components.

export async function fetchProfilePageData(
  userId: string,
  userEmail: string,
  userCreatedAt: string,
): Promise<ProfilePageData> {
  try {
    return await getProfilePageData(userId, userEmail, userCreatedAt);
  } catch {
    throw new Error("No se pudo cargar el perfil.");
  }
}

export async function updateDisplayNameAction(
  userId: string,
  displayName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    return await updateDisplayName(userId, displayName);
  } catch {
    return { success: false, error: "Error al actualizar el nombre." };
  }
}

export async function deleteAccountAction(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    return await deleteAccount(userId);
  } catch {
    return { success: false, error: "Error al eliminar la cuenta." };
  }
}
