import { apiFetchAsGuest } from '@/lib/api-client';
import type { LibraryViewModel } from '../types';

export async function getLibrarySeasons(): Promise<LibraryViewModel> {
  const res = await apiFetchAsGuest('/users/me/library');
  if (!res.ok) {
    throw new Error(`Library request failed (${res.status})`);
  }
  return res.json();
}

export async function archiveSeason(seasonId: string): Promise<void> {
  const res = await apiFetchAsGuest(`/seasons/${seasonId}/archive`, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Archive failed (${res.status})`);
  }
}

export async function unarchiveSeason(seasonId: string): Promise<void> {
  const res = await apiFetchAsGuest(`/seasons/${seasonId}/unarchive`, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Unarchive failed (${res.status})`);
  }
}
