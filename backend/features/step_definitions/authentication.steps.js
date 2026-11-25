import "dotenv/config";
import { AfterAll, BeforeAll, Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import mongoose from "mongoose";

if (!process.env.MONGO_URI_TEST) {
  throw new Error("MONGO_URI_TEST is required for authentication BDD tests.");
}
if (process.env.MONGO_URI_TEST === process.env.MONGO_URI) {
  throw new Error("BDD tests must use a separate test database.");
}

process.env.JWT_SECRET ||= "test-secret-for-authentication-bdd";

const { default: app } = await import("../../src/app.js");
const { default: User } = await import("../../src/models/User.js");

let server;
let baseUrl;
let email;
let response;
let responseData;

BeforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

AfterAll(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
});

Given("a new user has valid signup details", function () {
  email = `bdd-auth-${Date.now()}-${Math.random().toString(36).slice(2)}@resourcehub.test`;
});

When("the user submits the signup form", async function () {
  response = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "BDD Authentication User",
      email,
      department: "IT",
      password: "password123",
    }),
  });
  responseData = await response.json();
});

Then("the account should be created", function () {
  assert.equal(response.status, 201);
  assert.ok(responseData.user, "Expected the signup response to include a user ID");
});

Given("a registered user exists", async function () {
  email = `bdd-auth-${Date.now()}-${Math.random().toString(36).slice(2)}@resourcehub.test`;
  await User.create({
    name: "BDD Authentication User",
    email,
    department: "IT",
    password: "correct-password",
  });
});

When("the user logs in with an incorrect password", async function () {
  response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "wrong-password" }),
  });
  responseData = await response.json();
});

Then("login should be rejected", function () {
  assert.equal(response.status, 400);
  assert.equal(responseData.password, "that password is incorrect");
  assert.doesNotMatch(response.headers.get("set-cookie") || "", /jwt=/);
});
