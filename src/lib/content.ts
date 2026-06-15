export type ContentBlock = {
  id: string;
  page_slug: string;
  section_key: string;
  content_key: string;
  value: string | null;
  type: string;
  json_value: any | null;
  created_at: string;
  updated_at: string;
};

export async function fetchContentBlocks(): Promise<ContentBlock[]> {
  try {
    const res = await fetch('/api/content');
    if (!res.ok) throw new Error('Failed to fetch content blocks');
    const data = await res.json();
    return (data || []) as ContentBlock[];
  } catch (error) {
    console.warn('Unable to fetch content blocks', error);
    return [];
  }
}

export async function fetchContentBlock(pageSlug: string, sectionKey: string, contentKey: string): Promise<ContentBlock | null> {
  try {
    const res = await fetch(`/api/content?page_slug=${pageSlug}`);
    if (!res.ok) throw new Error('Failed to fetch content block');
    const data = await res.json();
    return data.find((b: any) => b.section_key === sectionKey && b.content_key === contentKey) || null;
  } catch (error) {
    console.warn('Unable to fetch content block', pageSlug, sectionKey, contentKey, error);
    return null;
  }
}

export async function upsertContentBlock(payload: Partial<ContentBlock>) {
  const normalized: any = { ...payload };
  if (normalized.type === 'json') {
    normalized.json_value = payload.json_value ?? null;
    normalized.value = null;
  } else {
    normalized.value = payload.value ?? null;
    normalized.json_value = null;
  }

  try {
    const res = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalized)
    });
    if (!res.ok) throw new Error('Failed to save');
    return await res.json();
  } catch (error) {
    throw error;
  }
}
