import "dotenv/config";

import { Given, When, Then } from "@cucumber/cucumber";
import axios from "axios";
import assert from "node:assert/strict";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

const BASE_URL = "http://127.0.0.1:5000/api";

let client;
let response;

// Admin test account
const admin = {
  email: process.env.BDD_ADMIN_EMAIL,
  password: process.env.BDD_ADMIN_PASSWORD,
};

// Faculty test account
const faculty = {
  email: process.env.BDD_FACULTY_EMAIL,
  password: process.env.BDD_FACULTY_PASSWORD,
};

// Login helper function
async function loginAs(user) {
  assert.ok(user.email, "Missing test user email");
  assert.ok(user.password, "Missing test user password");

  const jar = new CookieJar();

  client = wrapper(
    axios.create({
      baseURL: BASE_URL,
      jar,
      validateStatus: () => true,
    })
  );

  const loginResponse = await client.post("/auth/login", {
    email: user.email,
    password: user.password,
  });

  // Display detailed login error if authentication fails
  if (loginResponse.status !== 200) {
    throw new Error(
      `Login failed: HTTP ${loginResponse.status}. Response: ${JSON.stringify(
        loginResponse.data
      )}`
    );
  }
}

// Scenario 1: Admin login
Given(
  "the user is logged in as an administrator",
  async function () {
    await loginAs(admin);
  }
);

// Scenario 2: Faculty login
Given(
  "the user is logged in as a faculty member",
  async function () {
    await loginAs(faculty);
  }
);

// Admin creates a resource
When(
  "the administrator submits valid resource details",
  async function () {
    response = await client.post("/resources", {
      name: "BDD Admin Test Resource",
      category: "equipment",
      capacity: 10,
      location: "Engineering Faculty",
    });
  }
);

// Faculty attempts to create a resource
When(
  "the faculty member attempts to create a resource",
  async function () {
    response = await client.post("/resources", {
      name: "BDD Faculty Test Resource",
      category: "equipment",
      capacity: 10,
      location: "Engineering Faculty",
    });
  }
);

// Verify successful resource creation
Then(
  "the resource should be created successfully",
  function () {
    assert.ok(
      response.data.resource,
      "Created resource was not returned"
    );
  }
);

// Verify resource was not created
Then(
  "the resource should not be created",
  function () {
    assert.notEqual(
      response.status,
      201,
      "Faculty member should not be able to create resources"
    );
  }
);

// Verify HTTP response status
Then(
  "the response status should be {int}",
  function (expectedStatus) {
    assert.equal(response.status, expectedStatus);
  }
);
