
import {
    BeforeAll,
    AfterAll,
    Given,
    When,
    Then
} from "@cucumber/cucumber";

import assert from "node:assert/strict";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

if (!process.env.MONGO_URI_TEST)
{
    throw new Error("MONGO_URI_TEST is required.");
}

if (process.env.MONGO_URI_TEST === process.env.MONGO_URI)
{
    throw new Error("Tests must use a separate test database.");
}

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-cucumber";

const { default: app } = await import("../../src/app.js");
const { default: User } = await import("../../src/models/User.js");
const { default: Resource } = await import("../../src/models/Resource.js");
const { default: Reservation } = await import("../../src/models/Reservation.js");

let server;
let baseUrl;
let facultyCookie;
let faculty;
let resource;
let response;
let responseData;

function futureTime(daysAhead, hour)
{
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    date.setHours(hour, 0, 0, 0);

    return date.toISOString();
}

BeforeAll(async () =>
{
    await mongoose.connect(process.env.MONGO_URI_TEST);

    const uniqueId = Date.now();

    faculty = await User.create({
        name: "Cucumber Faculty",
        email: `cucumber-${uniqueId}@resourcehub.test`,
        password: "faculty123",
        department: "EIE"
    });

    resource = await Resource.create({
        name: `Cucumber Hall ${uniqueId}`,
        category: "lecture_hall",
        capacity: 100,
        location: "Main Building",
        createdBy: faculty._id
    });

    server = app.listen(0);
    baseUrl = `http://127.0.0.1:${server.address().port}`;

    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: faculty.email,
            password: "faculty123"
        })
    });

    assert.equal(loginResponse.status, 200);

    facultyCookie = (loginResponse.headers.get("set-cookie") || "")
        .split(";")[0];

    assert.ok(facultyCookie.startsWith("jwt="));
});

AfterAll(async () =>
{
    if (faculty)
    {
        await Reservation.deleteMany({ user: faculty._id });
        await Resource.deleteMany({ _id: resource._id });
        await User.deleteMany({ _id: faculty._id });
    }

    if (server)
    {
        await new Promise((resolve) => server.close(resolve));
    }

    await mongoose.disconnect();
});

Given("a faculty user is logged in", async () =>
{
    assert.ok(facultyCookie);
});

Given("a resource is available", async () =>
{
    assert.ok(resource);
});

When("the faculty user submits a reservation with valid future dates", async () =>
{
    response = await fetch(`${baseUrl}/api/reservations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: facultyCookie
        },
        body: JSON.stringify({
            resourceId: String(resource._id),
            startTime: futureTime(2, 10),
            endTime: futureTime(2, 12),
            purpose: "Cucumber BDD Test"
        })
    });

    responseData = await response.json();
});

Then("the reservation should be created successfully", () =>
{
    assert.equal(response.status, 201);
});

Then("the reservation status should be {string}", (status) =>
{
    assert.equal(responseData.reservation.status, status);
});

When("the faculty user submits a reservation with an end time before the start time", async () =>
{
    response = await fetch(`${baseUrl}/api/reservations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: facultyCookie
        },
        body: JSON.stringify({
            resourceId: String(resource._id),
            startTime: futureTime(3, 14),
            endTime: futureTime(3, 13),
            purpose: "Invalid Cucumber Test"
        })
    });

    responseData = await response.json();
});

Then("the reservation should be rejected", () =>
{
    assert.equal(response.status, 400);
});

Then("a validation error should be returned", () =>
{
    assert.ok(responseData.message);
});
