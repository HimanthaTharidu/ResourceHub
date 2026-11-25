// authentication test cases
import { describe, test, expect, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {
  handleErrors,
  createToken,
  cookieOptions,
} from "../src/controllers/authController.js";

dotenv.config();

let server;
let baseUrl;

if (!process.env.MONGO_URI_TEST) {
  throw new Error("MONGO_URI_TEST environment variable is not defined");
}

if (process.env.MONGO_URI_TEST === process.env.MONGO_URI) {
  throw new Error("MONGO_URI_TEST should not be the same as MONGO_URI");
}

const { default: User } = await import("../src/models/User.js");
const { default: app } = await import("../src/app.js");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
  await Promise.all([User.deleteMany({})]);
  await User.init();
  process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret"; // Set a test secret

  server = app.listen(0);
  baseUrl = `http://localhost:${server.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve)); // Wait for 1 second before closing the connection
  await mongoose.connection.close();
});

describe("TC_AUTH_001 - Register a new user with valid details", () => {
  test("should return 201 and user id when registering a new user with valid details", async () => {
    // AAA patern

    // Arrange
    const userData = {
      name: "user1",
      email: "user@gmail.com",
      department: "IT",
      password: "password123",
    };

    // Act
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    // Assert
    expect(response.status).toBe(201);
    const responseData = await response.json();
    expect(responseData).toEqual({ user: expect.any(String) });
  });
});

describe("TC_AUTH_002 - Register a new user with an existing email", () => {
  test("should return 400 when registering a new user with an existing email", async () => {
    // write AAA in sigle line of code

    // Arrange
    const userData = {
      name: "user2",
      email: "user@gmail.com",
      department: "IT",
      password: "password123",
    };

    // Act
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    // Assert
    expect(response.status).toBe(400);
    const responseData = await response.json();
    expect(responseData).toEqual({
      email: "Email already exist",
      password: "",
    });
  });
});

describe("Registration validation", () => {
  test("TC_AUTH_003 - returns field errors when required email and password are missing", async () => {
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Missing Fields User",
        department: "IT",
      }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      email: "Please add an email",
      password: "Please add a password",
    });
  });

  test("TC_AUTH_004 - returns an email error for an invalid email address", async () => {
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Invalid Email User",
        email: "not-an-email",
        department: "IT",
        password: "password123",
      }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      email: "Please enter a valid email address",
      password: "",
    });
  });

  test("TC_AUTH_005 - returns a password error when the password is shorter than six characters", async () => {
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Short Password User",
        email: `short-password-${Date.now()}@resourcehub.test`,
        department: "IT",
        password: "12345",
      }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      email: "",
      password: "minimum length should bee 6",
    });
  });

  test("TC_AUTH_006 - rejects a password that does not match confirm password", async () => {
    const countBefore = await User.countDocuments();
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Mismatched Password User",
        email: `mismatch-${Date.now()}@resourcehub.test`,
        department: "IT",
        password: "password123",
        confirmPassword: "different123",
      }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      email: "",
      password: "Passwords do not match",
    });
    expect(await User.countDocuments()).toBe(countBefore);
    expect(response.headers.get("set-cookie") || "").not.toMatch(/jwt=/);
  });
});

describe("TC_AUTH_007 - Authentication rejects NoSQL selector injection", () => {
  test("signup rejects an operator object as the email", async () => {
    // Arrange
    const countBefore = await User.countDocuments();
    const userData = {
      name: "Injection Test",
      email: "{ $ne: null }",
      department: "IT",
      password: "password123",
    };

    // Act
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    // Assert
    expect(response.status).toBe(400);
    expect(await User.countDocuments()).toBe(countBefore);
    const responseData = await response.json();
    expect(responseData).toEqual({
      email: "Please enter a valid email address",
      password: "",
    });
  });

  test("login does not authenticate an operator-object email", async () => {
    // Arrange
    const email = `injection-${Date.now()}@resourcehub.test`;
    await User.create({
      name: "Login Test",
      email,
      department: "IT",
      password: "password123",
    });

    // Act
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: { $ne: null },
        password: "pwd123",
      }),
    });

    // Assert
    expect(response.status).toBe(400);
    expect(response.headers.get("set-cookie") || "").not.toMatch(/jwt=/);
  });
});

describe("TC_AUTH_009 - loign with valid credentials", () => {
  test("should return 200 and set a cookie when logging in with valid credentials", async () => {
    // Arrange
    await User.create({
      name: "login test",
      email: "logintest@gmail.com",
      department: "IT",
      password: "password456",
    });

    // Act
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "logintest@gmail.com",
        password: "password456",
      }),
    });

    // Assert
    expect(response.status).toBe(200);
    const cookies = response.headers.get("set-cookie");
    expect(cookies).toMatch(/jwt=/);
  });
});

describe("TC_AUTH_010 - login with incorrect password", () => {
  test("should return 400 without setting a cookie when the password is incorrect", async () => {
    const email = `incorrect-password-${Date.now()}@resourcehub.test`;
    await User.create({
      name: "Incorrect Password User",
      email,
      department: "IT",
      password: "correct-password",
    });

    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: "wrong-password",
      }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      email: "",
      password: "that password is incorrect",
    });
    expect(response.headers.get("set-cookie") || "").not.toMatch(/jwt=/);
  });
});

describe("TC_AUTH_011 - login with a non-existent email", () => {
  test("should return 400 with an email error and no authentication cookie", async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `not-registered-${Date.now()}@resourcehub.test`,
        password: "password123",
      }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      email: "that is not registered",
      password: "",
    });
    expect(response.headers.get("set-cookie") || "").not.toMatch(/jwt=/);
  });
});

describe("TC_AUTH_012 - login with empty fields", () => {
  test("should return 400 when email and password are empty", async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "", password: "" }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      email: "that is not registered",
      password: "",
    });
    expect(response.headers.get("set-cookie") || "").not.toMatch(/jwt=/);
  });
});

describe("TC_AUTH_013 - login with different email casing", () => {
  test("should authenticate when the email casing differs from the stored email", async () => {
    const email = `email-case-${Date.now()}@resourcehub.test`;
    const password = "password123";
    await User.create({
      name: "Email Case User",
      email,
      department: "IT",
      password,
    });

    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.toUpperCase(),
        password,
      }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ user: expect.any(String) });
    expect(response.headers.get("set-cookie") || "").toMatch(/jwt=/);
  });
});

describe("TC_AUTH_019 - Reapted failed attempts to login with invalid credentials", () => {
  test("throttles repeated failed login attempts", async () => {
    // Arrange
    const email = `bruteforce-${Date.now()}@resourcehub.test`;
    await User.create({
      name: "Rate Limit Test",
      email,
      department: "IT",
      password: "correct-password",
    });

    // Act and assert: five incorrect attempts are allowed, but do not authenticate
    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "wrong-password" }),
      });

      expect(response.status).toBe(400);
      expect(response.headers.get("set-cookie") || "").not.toMatch(/jwt=/);
      await response.body?.cancel();
    }

    // The next attempt within the window should be throttled
    const limitedResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "wrong-password" }),
    });

    expect(limitedResponse.status).toBe(429);
  });
});

describe("Token/Session Management", () => {
  test("TC_AUTH_016 - should create a JWT token and set it in a cookie upon successful login", async () => {
    // Arrange
    const email = `testuser-${Date.now()}@resourcehub.test`;
    const password = "password123";
    await User.create({
      name: "Test User",
      email,
      department: "IT",
      password,
    });

    // Act
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const responseData = await response.json();
    const cookie = response.headers.get("set-cookie");
    const token = cookie.match(/(?:^|;\s*)jwt=([^;]+)/)?.[1];

    // Assert
    expect(response.status).toBe(200);
    expect(token).toBeTruthy();

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    expect(payload).toMatchObject({ id: responseData.user });
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  test("TC_AUTH_017 - Rejects access to /auth/me when no token is provided", async () => {
    // Arrange / Act
    const response = await fetch(`${baseUrl}/api/auth/me`);

    // Assert
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      message: "Authentication required",
    });
  });

  test("TC_AUTH_18 - Rejects malformed and tampered tokens on /auth/me", async () => {
    // Arrange
    const signedToken = jwt.sign(
      { id: new mongoose.Types.ObjectId().toString() },
      process.env.JWT_SECRET,
    );
    const [header, , signature] = signedToken.split(".");
    const alteredPayload = Buffer.from(
      JSON.stringify({ id: "tampered-user-id" }),
    ).toString("base64url");
    const tokens = [
      "not-a-valid-token",
      `${header}.${alteredPayload}.${signature}`,
    ];

    // Act / Assert
    for (const token of tokens) {
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Cookie: `jwt=${token}` },
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        message: "Invalid or expired token",
      });
    }
  });

  test("TC_AUTH_019 - Logout clears the JWT cookie", async () => {
    // Arrange
    const email = `logout-${Date.now()}@resourcehub.test`;
    const password = "password123";
    await User.create({
      name: "Logout Test",
      email,
      department: "IT",
      password,
    });

    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    expect(loginResponse.status).toBe(200);
    const cookie = (loginResponse.headers.get("set-cookie") || "").split(";")[0];

    // Act
    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    const clearedCookie = logoutResponse.headers.get("set-cookie") || "";

    // Assert
    expect(logoutResponse.status).toBe(200);
    expect(await logoutResponse.json()).toEqual({ message: "Logged out" });
    expect(clearedCookie).toMatch(/^jwt=;/);
    expect(clearedCookie).toMatch(/Expires=/i);

    const meResponse = await fetch(`${baseUrl}/api/auth/me`);
    expect(meResponse.status).toBe(401);
  });
});


describe("Edge cases", () => {
  test("TC_AUTH_23 - should handle special characters in email and password during signup", async () => {
    const email = `special-${Date.now()}+tag@resourcehub.test`;
    const password = "p@ssword!123";
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Special Characters User",
        email,
        department: "IT",
        password,
      }),
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ user: expect.any(String) });
  });

  test("TC_AUTH_21 - should handle concurrent registration attempts with the same email gracefully", async () => {
    const email = `concurrent-${Date.now()}@resourcehub.test`;
    const userData = {
      name: "Concurrent Registration User",
      email,
      department: "IT",
      password: "password123",
    };
    const request = () =>
      fetch(`${baseUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

    const responses = await Promise.all([request(), request()]);
    expect(responses.map(({ status }) => status).sort((a, b) => a - b)).toEqual([
      201,
      400,
    ]);

    const successfulResponse = responses.find(({ status }) => status === 201);
    const failedResponse = responses.find(({ status }) => status === 400);
    expect(await successfulResponse.json()).toEqual({
      user: expect.any(String),
    });
    expect(await failedResponse.json()).toEqual({
      email: "Email already exist",
      password: "",
    });
    expect(failedResponse.headers.get("set-cookie") || "").not.toMatch(/jwt=/);
    expect(await User.countDocuments({ email })).toBe(1);
  });


});