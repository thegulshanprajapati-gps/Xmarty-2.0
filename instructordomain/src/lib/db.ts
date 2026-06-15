// Mock Supabase Client that routes all CRUD operations to MongoDB Atlas API Gateway in supportdomain

const gatewayUrl = '/api/mongodb-gateway';

function normalizeMongoDoc(doc: any): any {
  if (!doc || typeof doc !== 'object') return doc;
  if (Array.isArray(doc)) {
    return doc.map(normalizeMongoDoc);
  }
  const newDoc = { ...doc };
  if (newDoc._id) {
    newDoc.id = newDoc._id.toString();
  }
  for (const key of Object.keys(newDoc)) {
    if (newDoc[key] && typeof newDoc[key] === 'object') {
      newDoc[key] = normalizeMongoDoc(newDoc[key]);
    }
  }
  return newDoc;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

class MongoQueryBuilder {
  private collection: string;
  private filter: Record<string, any> = {};
  private options: {
    sort?: Record<string, number>;
    limit?: number;
    skip?: number;
  } = {};
  private pendingAction: string = 'find';
  private pendingData: any = null;

  constructor(collection: string) {
    this.collection = collection;
  }

  select(fields?: string) {
    return this;
  }

  eq(field: string, value: any) {
    const finalField = field === 'id' ? '_id' : field;
    this.filter[finalField] = value;
    return this;
  }

  in(field: string, values: any[]) {
    const finalField = field === 'id' ? '_id' : field;
    this.filter[finalField] = { $in: values };
    return this;
  }

  match(filters: Record<string, any>) {
    Object.assign(this.filter, filters);
    return this;
  }

  order(field: string, opts?: { ascending?: boolean }) {
    const asc = opts?.ascending !== false ? 1 : -1;
    this.options.sort = { [field]: asc };
    return this;
  }

  limit(num: number) {
    this.options.limit = num;
    return this;
  }

  insert(data: any | any[]) {
    this.pendingAction = 'insertOne';
    this.pendingData = Array.isArray(data) ? data[0] : data;
    return this;
  }

  update(data: any) {
    this.pendingAction = 'updateOne';
    this.pendingData = data;
    return this;
  }

  upsert(data: any | any[], opts?: any) {
    this.pendingAction = 'upsert';
    this.pendingData = Array.isArray(data) ? data[0] : data;
    return this;
  }

  delete() {
    this.pendingAction = 'deleteMany';
    return this;
  }

  async execute() {
    let action = this.pendingAction;
    let data = this.pendingData;
    let filter = { ...this.filter };

    if (action === 'upsert' && data) {
      if (data.slug) filter.slug = data.slug;
      if (data.key) filter.key = data.key;
      if (data.page_slug && data.section_key && data.content_key) {
        filter.page_slug = data.page_slug;
        filter.section_key = data.section_key;
        filter.content_key = data.content_key;
      }
      if (data._id) filter._id = data._id;
      if (data.id) filter._id = data.id;
    }

    try {
      let csrfToken = getCookie('csrf_token');
      if (!csrfToken && typeof window !== 'undefined') {
        try {
          const csrfRes = await fetch('/api/auth/csrf');
          const csrfJson = await csrfRes.json();
          csrfToken = csrfJson.csrfToken;
        } catch (e) {
          console.error('Failed to initialize CSRF token:', e);
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }

      const res = await fetch(gatewayUrl, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          action,
          collection: this.collection,
          filter,
          data,
          options: this.options,
        }),
      });

      const json = await res.json();

      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('xmarty_session');
          window.location.href = '/login?reason=session_expired';
        }
        return { data: null, error: { message: 'Session expired. Please log in again.' } };
      }

      if (res.status === 403) {
        return { data: null, error: { message: json.error || 'Permission denied.' } };
      }

      if (json.error) {
        return { data: null, error: { message: json.error } };
      }
      
      let normalized = normalizeMongoDoc(json.data);
      if ((action === 'upsert' || action === 'insertOne') && data) {
        normalized = { ...data, id: normalized?._id?.toString() || normalized?.upsertedId || data.id };
      }
      return { data: normalized, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err?.message || String(err) } };
    }
  }

  async single() {
    if (this.pendingAction === 'find') {
      this.pendingAction = 'findOne';
    }
    return this.execute();
  }

  async maybeSingle() {
    if (this.pendingAction === 'find') {
      this.pendingAction = 'findOne';
    }
    return this.execute();
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  catch(onrejected?: (reason: any) => any) {
    return this.execute().catch(onrejected);
  }
}

class MockAuthClient {
  private listeners: Array<(event: string, session: any) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', () => {
        const session = this.getStoredSession();
        this.notify('SIGNED_IN', session);
      });
    }
  }

  private getStoredSession() {
    if (typeof window === 'undefined') return null;
    const sessionStr = localStorage.getItem('xmarty_session');
    return sessionStr ? JSON.parse(sessionStr) : null;
  }

  async getSession() {
    const session = this.getStoredSession();
    return { data: { session }, error: null };
  }

  async getUser() {
    const session = this.getStoredSession();
    return { data: { user: session?.user || null }, error: null };
  }

  async signInWithPassword({ email, password }: any) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        return { data: null, error: { message: json.error || 'Login failed' } };
      }
      
      const session = { user: json.user, access_token: 'mock_token' };
      if (typeof window !== 'undefined') {
        localStorage.setItem('xmarty_session', JSON.stringify(session));
      }
      this.notify('SIGNED_IN', session);
      return { data: { user: json.user, session }, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err?.message || String(err) } };
    }
  }

  async signUp({ email, password, options }: any) {
    // Note: Sign up is not typically used for instructor accounts, but we update it to align if needed.
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    const user = { id: userId, email, ...options?.data };
    const session = { user, access_token: 'mock_token' };

    if (typeof window !== 'undefined') {
      localStorage.setItem('xmarty_session', JSON.stringify(session));
    }

    let csrfToken = getCookie('csrf_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (csrfToken) headers['x-csrf-token'] = csrfToken;

    await fetch(gatewayUrl, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        action: 'upsert',
        collection: 'users',
        filter: { email },
        data: { id: userId, email, full_name: options?.data?.full_name || '', role: 'student', enrolled_courses: [] },
      }),
    });

    this.notify('SIGNED_IN', session);
    return { data: { user, session }, error: null };
  }

  async signOut() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('xmarty_session');
    }
    this.notify('SIGNED_OUT', null);
    return { error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    const session = this.getStoredSession();
    callback('INITIAL_SESSION', session);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          }
        }
      }
    };
  }

  private notify(event: string, session: any) {
    this.listeners.forEach(l => l(event, session));
  }
}

export const db = {
  from(collection: string) {
    const mappedCollection = collection === 'profiles' ? 'users' : collection;
    return new MongoQueryBuilder(mappedCollection);
  },
  auth: new MockAuthClient(),
};
