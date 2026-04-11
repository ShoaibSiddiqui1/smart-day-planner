import AsyncStorage from '@react-native-async-storage/async-storage';

//const BASE_URL = 'http://172.22.232.172:8000'; // for wsl

const BASE_URL = 'http://192.168.1.175:8000'; // for expo go testing

type RequestOptions = RequestInit & {
  headers?: Record<string, string>;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
};

type User = {
  id?: number;
  username?: string;
  email?: string;
  home_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  profile_picture?: string | null;
  is_active?: boolean;
  created_at?: string;
};

type UserUpdatePayload = {
  username?: string;
  email?: string;
  home_address?: string;
  latitude?: number;
  longitude?: number;
  profile_picture?: string | null;
};

type TaskPayload = {
  title: string;
  location: string;
  duration_minutes: number;
  priority: number;
  earliest_start?: string;
  latest_end?: string;
  latitude?: number;
  longitude?: number;
};

type TaskUpdatePayload = {
  title?: string;
  location?: string;
  duration_minutes?: number;
  priority?: number;
  earliest_start?: string;
  latest_end?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
};

type Task = {
  id: number;
  title: string;
  location: string;
  duration_minutes?: number;
  priority?: number;
  earliest_start?: string;
  latest_end?: string;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  status?: string;
  owner_id?: number;
  created_at?: string;
  updated_at?: string;
};

type ScheduleItem = {
  id?: number;
  position?: number;
  scheduled_start?: string;
  scheduled_end?: string;
  travel_time_minutes?: number;
  task?: Task;
};

type Schedule = {
  id?: number;
  user_id?: number;
  schedule_date?: string;
  status?: string;
  total_duration_minutes?: number;
  items?: ScheduleItem[];
  created_at?: string;
  updated_at?: string;
};

async function saveToken(token: string) {
  await AsyncStorage.setItem('token', token);
}

async function getToken() {
  const token = await AsyncStorage.getItem('token');

  if (!token) {
    throw new Error('No token found. Please log in again.');
  }

  return token;
}

async function removeToken() {
  await AsyncStorage.removeItem('token');
}

async function parseResponse(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (res.status === 204) {
    return null;
  }

  const text = await res.text();

  if (!text) {
    return null;
  }

  if (isJson) {
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error('JSON parse error:', err);
      throw new Error('Invalid JSON response from server');
    }
  }

  return text;
}

async function request(path: string, options: RequestOptions = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    console.error('API ERROR:', data);
    throw new Error(
      typeof data === 'object' && data && 'detail' in data
        ? String((data as any).detail)
        : 'Request failed'
    );
  }

  return data;
}

async function authFetch(path: string, options: RequestOptions = {}) {
  const token = await getToken();

  console.log('AUTH REQUEST:', path);
  console.log('TOKEN EXISTS:', !!token);
  console.log('TOKEN PREVIEW:', token ? token.slice(0, 20) : 'null');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    console.error('AUTH API ERROR:', data);
    console.error('FAILED PATH:', path);
    console.error('STATUS:', res.status);

    if (res.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }

    throw new Error(
      typeof data === 'object' && data && 'detail' in data
        ? String((data as any).detail)
        : 'Request failed'
    );
  }

  return data;
}

/* ================= AUTH ================= */

export const authApi = {
  register: (payload: {
    username: string;
    email: string;
    password: string;
    home_address?: string;
  }) =>
    request('/users/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<User>,

  login: async (email: string, password: string) => {
    const body = new URLSearchParams();
    body.append('username', email);
    body.append('password', password);

    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = (await parseResponse(res)) as LoginResponse;

    if (!res.ok) {
      throw new Error(
        typeof data === 'object' && data && 'detail' in (data as any)
          ? String((data as any).detail)
          : 'Login failed'
      );
    }

    if (!data?.access_token) {
      throw new Error('No access token returned');
    }

    await saveToken(data.access_token);
    return data;
  },

  getMe: () => authFetch('/users/me') as Promise<User>,

  updateMe: (payload: UserUpdatePayload) =>
    authFetch('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }) as Promise<User>,

  forgotPassword: (email: string) =>
    request('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }) as Promise<{ message: string; reset_token?: string }>,

  resetPassword: (token: string, newPassword: string) =>
    request('/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token,
        new_password: newPassword,
      }),
    }) as Promise<{ message: string }>,

  logout: async () => {
    await removeToken();
  },

  getStoredToken: async () => {
    return AsyncStorage.getItem('token');
  },
};

/* ================= TASKS ================= */

export const taskApi = {
  create: (task: TaskPayload) =>
    authFetch('/tasks/', {
      method: 'POST',
      body: JSON.stringify(task),
    }) as Promise<Task>,

  getAll: () => authFetch('/tasks/') as Promise<Task[]>,

  getById: (id: number) =>
    authFetch(`/tasks/${id}`) as Promise<Task>,

  update: (id: number, updates: TaskUpdatePayload) =>
    authFetch(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }) as Promise<Task>,

  delete: (id: number) =>
    authFetch(`/tasks/${id}`, {
      method: 'DELETE',
    }) as Promise<null>,
};

/* ================= SCHEDULE ================= */

export const scheduleApi = {
  generate: () =>
    authFetch('/schedules/generate', {
      method: 'POST',
    }) as Promise<Schedule>,

  getLatest: () => authFetch('/schedules/latest') as Promise<Schedule>,
};

/* ================= EXPORT TYPES ================= */

export type {
  User,
  UserUpdatePayload,
  Task,
  TaskPayload,
  TaskUpdatePayload,
  Schedule,
  ScheduleItem,
  LoginResponse,
};