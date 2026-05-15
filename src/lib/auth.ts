const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:3002";

export type AuthUser = {
  sub: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "STAFF" | string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

const TOKEN_KEY = "rentamivar_access_token";
const USER_KEY = "rentamivar_user";
export const AUTH_COOKIE = "rentamivar_access_token";

export async function login(email: string, password: string): Promise<LoginResponse | null> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return null;
    }

    return response.json() as Promise<LoginResponse>;
  } catch {
    return null;
  }
}

export function saveSession(session: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  document.cookie = `${AUTH_COOKIE}=${session.accessToken}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;
  window.dispatchEvent(new Event("rentamivar-auth-change"));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  window.dispatchEvent(new Event("rentamivar-auth-change"));
}

export function getStoredUserRaw(): string | null {
  return localStorage.getItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
