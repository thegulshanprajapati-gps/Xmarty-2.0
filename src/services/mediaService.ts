import { MediaAsset, MediaFolder, MediaQueryParams, MediaResponse } from '@/utils/media';

function buildQuery(params: MediaQueryParams) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });
  return query.toString();
}

export async function fetchMedia(params: MediaQueryParams) {
  const query = buildQuery(params);
  const response = await fetch(`/api/media?${query}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Unable to load media items.');
  }
  return (await response.json()) as MediaResponse;
}

export async function uploadMedia(file: File, meta: { folderId?: string; folderName?: string; tags?: string[]; name?: string }) {
  const data = new FormData();
  data.append('file', file);
  data.append('name', meta.name || file.name);
  if (meta.folderId) data.append('folderId', meta.folderId);
  if (meta.folderName) data.append('folderName', meta.folderName);
  if (meta.tags?.length) data.append('tags', meta.tags.join(','));

  const response = await fetch('/api/media', { method: 'POST', body: data });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.error || 'Upload failed');
  }
  return (await response.json()) as MediaAsset;
}

export async function updateMediaItem(id: string, body: Partial<MediaAsset>) {
  const response = await fetch(`/api/media/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.error || 'Update failed');
  }
  return (await response.json()) as MediaAsset;
}

export async function deleteMediaItem(id: string, hard = false) {
  const response = await fetch(`/api/media/${id}?hard=${hard}`, { method: 'DELETE' });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.error || 'Delete failed');
  }
  return (await response.json()) as { success: boolean; deleted?: boolean };
}

export async function batchMediaAction(action: string, ids: string[], payload: any = {}) {
  const response = await fetch('/api/media/batch', {
    method: 'POST',
    body: JSON.stringify({ action, ids, payload }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const bodyJson = await response.json();
    throw new Error(bodyJson.error || 'Bulk action failed');
  }
  return (await response.json()) as { success: boolean };
}

export async function fetchFolders(parentFolderId?: string) {
  const query = parentFolderId ? `?parentFolderId=${encodeURIComponent(parentFolderId)}` : '';
  const response = await fetch(`/api/media/folders${query}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Unable to load folders.');
  }
  return (await response.json()) as MediaFolder[];
}

export async function createFolder(name: string, parentFolderId?: string) {
  const response = await fetch('/api/media/folders', {
    method: 'POST',
    body: JSON.stringify({ name, parent_folder_id: parentFolderId }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.error || 'Failed to create folder');
  }
  return (await response.json()) as MediaFolder;
}

export async function updateFolder(id: string, body: Partial<MediaFolder>) {
  const response = await fetch(`/api/media/folders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.error || 'Failed to update folder');
  }
  return (await response.json()) as MediaFolder;
}

export async function deleteFolder(id: string) {
  const response = await fetch(`/api/media/folders/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.error || 'Failed to delete folder');
  }
  return (await response.json()) as { success: boolean };
}
