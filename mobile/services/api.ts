const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, body: object): Promise<{ data: T }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    const err: any = new Error(json?.detail ?? "Request failed");
    err.response = { data: json };
    throw err;
  }

  return { data: json };
}

export const authApi = {
  register: (username: string, email: string, password: string) =>
    request<{ id: number; username: string; email: string }>("/users/", { username, email, password }),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, new_password: string) =>
    request<{ message: string }>("/auth/reset-password", { token, new_password }),
};
