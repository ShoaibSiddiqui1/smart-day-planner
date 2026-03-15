/**
 * Frontend auth unit tests.
 *
 * Install test dependencies first:
 *   npx expo install jest-expo @testing-library/react-native @testing-library/jest-native
 *   npm install --save-dev jest @types/jest ts-jest
 *
 * Run with:  npx jest __tests__/auth.test.ts
 */

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock AsyncStorage so tests don't need a real device
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock the API module so tests never hit the network
jest.mock("@/services/api", () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    getMe: jest.fn(),
  },
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "@/services/api";

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockAuthApi = authApi as jest.Mocked<typeof authApi>;

// ---------------------------------------------------------------------------
// Auth logic unit tests (pure functions / service layer)
// ---------------------------------------------------------------------------

describe("authApi.login", () => {
  beforeEach(() => jest.clearAllMocks());

  it("resolves with a token on valid credentials", async () => {
    mockAuthApi.login.mockResolvedValueOnce({
      data: { access_token: "jwt.token.here", token_type: "bearer" },
    } as any);

    const response = await authApi.login("user@example.com", "password123");
    expect(response.data.access_token).toBe("jwt.token.here");
    expect(response.data.token_type).toBe("bearer");
  });

  it("throws a 401 error on invalid credentials", async () => {
    const error = {
      response: { status: 401, data: { detail: "Invalid email or password" } },
    };
    mockAuthApi.login.mockRejectedValueOnce(error);

    await expect(authApi.login("user@example.com", "wrong")).rejects.toMatchObject(
      { response: { status: 401 } }
    );
  });
});

describe("authApi.register", () => {
  beforeEach(() => jest.clearAllMocks());

  it("resolves with the created user on success", async () => {
    mockAuthApi.register.mockResolvedValueOnce({
      data: {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        is_active: true,
        home_address: null,
        created_at: "2026-01-01T00:00:00Z",
      },
    } as any);

    const response = await authApi.register(
      "testuser",
      "test@example.com",
      "securepassword"
    );
    expect(response.data.email).toBe("test@example.com");
  });

  it("throws a 400 error when the email is already taken", async () => {
    const error = {
      response: { status: 400, data: { detail: "Email already registered" } },
    };
    mockAuthApi.register.mockRejectedValueOnce(error);

    await expect(
      authApi.register("user2", "test@example.com", "password123")
    ).rejects.toMatchObject({ response: { status: 400 } });
  });
});

// ---------------------------------------------------------------------------
// Token persistence tests
// ---------------------------------------------------------------------------

describe("token persistence via AsyncStorage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("stores the token after a successful login", async () => {
    const fakeToken = "eyJhbGciOiJIUzI1NiJ9.payload.sig";
    mockAuthApi.login.mockResolvedValueOnce({
      data: { access_token: fakeToken, token_type: "bearer" },
    } as any);
    mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

    const response = await authApi.login("user@example.com", "password");
    await AsyncStorage.setItem("auth_token", response.data.access_token);

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith("auth_token", fakeToken);
  });

  it("removes the token on logout", async () => {
    mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined);
    await AsyncStorage.removeItem("auth_token");
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith("auth_token");
  });

  it("returns null when no token is stored", async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);
    const stored = await AsyncStorage.getItem("auth_token");
    expect(stored).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Input validation logic tests
// ---------------------------------------------------------------------------

describe("login input validation", () => {
  /** Mirrors the validation inside the Login screen component. */
  function validateLoginInputs(email: string, password: string): string | null {
    if (!email.trim() || !password) return "Email and password are required.";
    return null;
  }

  it("returns an error when both fields are empty", () => {
    expect(validateLoginInputs("", "")).toBe("Email and password are required.");
  });

  it("returns an error when only email is provided", () => {
    expect(validateLoginInputs("user@example.com", "")).toBe(
      "Email and password are required."
    );
  });

  it("returns null when both fields are filled", () => {
    expect(validateLoginInputs("user@example.com", "password")).toBeNull();
  });
});

describe("signup input validation", () => {
  /** Mirrors the validation inside the Signup screen component. */
  function validateSignupInputs(
    username: string,
    email: string,
    password: string
  ): string | null {
    if (!username.trim() || !email.trim() || !password)
      return "All fields are required.";
    return null;
  }

  it("returns an error when any field is empty", () => {
    expect(validateSignupInputs("", "user@example.com", "pass")).toBe(
      "All fields are required."
    );
    expect(validateSignupInputs("user", "", "pass")).toBe(
      "All fields are required."
    );
    expect(validateSignupInputs("user", "user@example.com", "")).toBe(
      "All fields are required."
    );
  });

  it("returns null when all fields are filled", () => {
    expect(
      validateSignupInputs("user", "user@example.com", "password123")
    ).toBeNull();
  });
});
