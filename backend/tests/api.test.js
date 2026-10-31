import { before, after, describe, it } from "node:test";
import assert from "node:assert/strict";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

if (!process.env.MONGO_URI_TEST) {
  throw new Error("Set MONGO_URI_TEST in backend/.env (a separate test database).");
}
if (process.env.MONGO_URI_TEST === process.env.MONGO_URI) {
  throw new Error("MONGO_URI_TEST must differ from MONGO_URI: the test database is wiped.");
}
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-automated-tests";

const { default: app } = await import("../src/app.js");
const { default: User } = await import("../src/models/User.js");
const { default: Resource } = await import("../src/models/Resource.js");
const { default: Reservation } = await import("../src/models/Reservation.js");

let server;
let baseUrl;
let adminCookie;
let facultyCookie;
let otherCookie;
let admin;
let hallA; // "Lecture Hall A"
let hallB; // "Lecture Hall B"

// ---------- helpers ----------

async function api(method, path, { body, cookie } = {}) {
  const response = await fetch(`${baseUrl}/api${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: response.status, data, headers: response.headers };
}

async function login(email, password) {
  const res = await api("POST", "/auth/login", { body: { email, password } });
  return { res, cookie: (res.headers.get("set-cookie") || "").split(";")[0] };
}

// `daysAhead` days from now at `hour` o'clock, as an ISO string
function at(daysAhead, hour) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function booking(resource, daysAhead, startHour, endHour, purpose = "Lecture") {
  return {
    resourceId: String(resource._id),
    startTime: at(daysAhead, startHour),
    endTime: at(daysAhead, endHour),
    purpose,
  };
}

// ---------- setup and cleanup ----------

before(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
  await Promise.all([User.deleteMany({}), Resource.deleteMany({}), Reservation.deleteMany({})]);
  await User.init(); // build the unique email index

  server = app.listen(0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  admin = await User.create({
    name: "Test Admin",
    email: "admin@resourcehub.test",
    password: "admin123",
    role: "admin",
    department: "EIE",
  });
  await User.create({ name: "Test Faculty", email: "faculty@resourcehub.test", password: "faculty123", department: "EIE" });
  await User.create({ name: "Other Faculty", email: "other@resourcehub.test", password: "other123", department: "EIE" });

  adminCookie = (await login("admin@resourcehub.test", "admin123")).cookie;
  facultyCookie = (await login("faculty@resourcehub.test", "faculty123")).cookie;
  otherCookie = (await login("other@resourcehub.test", "other123")).cookie;

  hallA = await Resource.create({ name: "Lecture Hall A", category: "lecture_hall", capacity: 120, location: "Main Building", createdBy: admin._id });
  hallB = await Resource.create({ name: "Lecture Hall B", category: "lecture_hall", capacity: 80, location: "Main Building", createdBy: admin._id });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
});


describe("Case 1: Sign up registers a new faculty user", () => {
  it("creates the account, sets the login cookie and gives the faculty role", async () => {
    const res = await api("POST", "/auth/signup", {
      body: { name: "New User", email: "new@resourcehub.test", password: "secret1", department: "EIE" },
    });
    assert.equal(res.status, 201);
    assert.match(res.headers.get("set-cookie") || "", /jwt=/);

    const saved = await User.findOne({ email: "new@resourcehub.test" });
    assert.equal(saved.role, "faculty");
    assert.notEqual(saved.password, "secret1"); // stored as a hash
  });
});


describe("Case 2: Duplicate email is rejected", () => {
  it("returns 400 'Email already exist'", async () => {
    const res = await api("POST", "/auth/signup", {
      body: { name: "Copy", email: "faculty@resourcehub.test", password: "secret1", department: "EIE" },
    });
    assert.equal(res.status, 400);
    assert.equal(res.data.email, "Email already exist");
  });
});


describe("Case 3: Login with a wrong password", () => {
  it("returns 400 'that password is incorrect' and no cookie", async () => {
    const { res, cookie } = await login("faculty@resourcehub.test", "wrong-password");
    assert.equal(res.status, 400);
    assert.equal(res.data.password, "that password is incorrect");
    assert.equal(cookie, "");
  });

  it("a correct password logs in", async () => {
    const { res, cookie } = await login("faculty@resourcehub.test", "faculty123");
    assert.equal(res.status, 200);
    assert.ok(cookie.startsWith("jwt="));
  });
});


describe("Case 4: Faculty cannot use admin features", () => {
  it("POST /api/resources returns 403 for faculty", async () => {
    const res = await api("POST", "/resources", {
      cookie: facultyCookie,
      body: { name: "Projector", category: "equipment", location: "Store" },
    });
    assert.equal(res.status, 403);
  });

  it("PUT and DELETE on a resource return 403 for faculty", async () => {
    const put = await api("PUT", `/resources/${hallA._id}`, { cookie: facultyCookie, body: { name: "Hacked" } });
    const del = await api("DELETE", `/resources/${hallA._id}`, { cookie: facultyCookie });
    assert.equal(put.status, 403);
    assert.equal(del.status, 403);
  });

  it("a logged-out user gets 401", async () => {
    const res = await api("GET", "/resources");
    assert.equal(res.status, 401);
  });
});


describe("Case 5: Required capacity is enforced", () => {
  it("a computer lab without capacity returns 400 with a capacity message", async () => {
    const res = await api("POST", "/resources", {
      cookie: adminCookie,
      body: { name: "Computer Lab 1", category: "computer_lab", location: "IT Building" },
    });
    assert.equal(res.status, 400);
    assert.match(res.data.message, /capacity/i);
  });

  it("a lecture hall without capacity returns 400", async () => {
    const res = await api("POST", "/resources", {
      cookie: adminCookie,
      body: { name: "Hall", category: "lecture_hall", location: "Main Building" },
    });
    assert.equal(res.status, 400);
  });

  it("equipment without capacity is accepted", async () => {
    const res = await api("POST", "/resources", {
      cookie: adminCookie,
      body: { name: "Projector 1", category: "equipment", location: "Store" },
    });
    assert.equal(res.status, 201);
  });
});


describe("Case 6: Admin edits then deletes a resource", () => {
  let id;

  before(async () => {
    const created = await api("POST", "/resources", {
      cookie: adminCookie,
      body: { name: "Seminar Room", category: "lecture_hall", capacity: 30, location: "Old Wing" },
    });
    id = created.data.resource._id;
  });

  it("the edit changes the location and availability", async () => {
    const res = await api("PUT", `/resources/${id}`, {
      cookie: adminCookie,
      body: { location: "New Wing", isAvailable: false },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.location, "New Wing");
    assert.equal(res.data.isAvailable, false);

    const saved = await Resource.findById(id);
    assert.equal(saved.location, "New Wing");
  });

  it("the delete removes the resource", async () => {
    const res = await api("DELETE", `/resources/${id}`, { cookie: adminCookie });
    assert.equal(res.status, 200);
    assert.equal(await Resource.findById(id), null);

    const again = await api("GET", `/resources/${id}`, { cookie: adminCookie });
    assert.equal(again.status, 404);
  });
});


describe("Case 7: Request a free time period", () => {
  it("is saved with status pending and appears in the user's own list", async () => {
    const res = await api("POST", "/reservations", {
      cookie: facultyCookie,
      body: booking(hallB, 1, 14, 16, "Lecture"),
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.reservation.status, "pending");

    const mine = await api("GET", "/reservations/me", { cookie: facultyCookie });
    assert.ok(mine.data.reservations.some((r) => r._id === res.data.reservation._id));
  });

  it("is not visible in another user's list", async () => {
    const mine = await api("GET", "/reservations/me", { cookie: otherCookie });
    assert.equal(mine.data.reservations.length, 0);
  });
});

// =====================================================================
describe("Case 8: Overlap is blocked, back-to-back is allowed", () => {
  before(async () => {
    // the existing 08:00-10:00 booking on Lecture Hall A (3 days ahead)
    const res = await api("POST", "/reservations", { cookie: facultyCookie, body: booking(hallA, 3, 8, 10) });
    assert.equal(res.status, 201);
  });

  it("09:00-11:00 overlaps and returns 409", async () => {
    const res = await api("POST", "/reservations", { cookie: otherCookie, body: booking(hallA, 3, 9, 11) });
    assert.equal(res.status, 409);
    assert.match(res.data.message, /already has a reservation/);
  });

  it("10:00-12:00 starts when the other ends and is accepted", async () => {
    const res = await api("POST", "/reservations", { cookie: otherCookie, body: booking(hallA, 3, 10, 12) });
    assert.equal(res.status, 201);
  });
});

// =====================================================================
describe("Case 9: Edit and cancel only while pending", () => {
  let pending;
  let approved;

  before(async () => {
    pending = (await api("POST", "/reservations", { cookie: facultyCookie, body: booking(hallB, 5, 8, 10, "Original") })).data.reservation;
    approved = (await api("POST", "/reservations", { cookie: facultyCookie, body: booking(hallB, 6, 8, 10, "Approved one") })).data.reservation;
    await api("PATCH", `/reservations/${approved._id}/status`, { cookie: adminCookie, body: { status: "approved" } });
  });

  it("a pending request can be edited", async () => {
    const res = await api("PUT", `/reservations/${pending._id}`, {
      cookie: facultyCookie,
      body: { purpose: "Changed purpose", startTime: at(5, 9), endTime: at(5, 11) },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.reservation.purpose, "Changed purpose");
  });

  it("an approved request cannot be edited (400)", async () => {
    const res = await api("PUT", `/reservations/${approved._id}`, { cookie: facultyCookie, body: { purpose: "Nope" } });
    assert.equal(res.status, 400);
  });

  it("an approved request cannot be cancelled (400)", async () => {
    const res = await api("DELETE", `/reservations/${approved._id}`, { cookie: facultyCookie });
    assert.equal(res.status, 400);
  });

  it("a pending request can be cancelled; the record is kept as cancelled", async () => {
    const res = await api("DELETE", `/reservations/${pending._id}`, { cookie: facultyCookie });
    assert.equal(res.status, 200);
    assert.equal(res.data.reservation.status, "cancelled");
    assert.ok(await Reservation.findById(pending._id));
  });

  it("the cancelled time can be booked again", async () => {
    const res = await api("POST", "/reservations", { cookie: otherCookie, body: booking(hallB, 5, 9, 11) });
    assert.equal(res.status, 201);
  });
});

// =====================================================================
describe("Case 10: Approve, reject and review twice", () => {
  let a;
  let b;

  before(async () => {
    a = (await api("POST", "/reservations", { cookie: facultyCookie, body: booking(hallB, 8, 8, 10, "Request A") })).data.reservation;
    b = (await api("POST", "/reservations", { cookie: facultyCookie, body: booking(hallB, 9, 8, 10, "Request B") })).data.reservation;
  });

  it("admin approves request A", async () => {
    const res = await api("PATCH", `/reservations/${a._id}/status`, { cookie: adminCookie, body: { status: "approved" } });
    assert.equal(res.status, 200);
    assert.equal(res.data.reservation.status, "approved");
  });

  it("admin rejects request B with a note", async () => {
    const res = await api("PATCH", `/reservations/${b._id}/status`, {
      cookie: adminCookie,
      body: { status: "rejected", adminNotes: "Room needed for exam" },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.reservation.status, "rejected");
    assert.equal(res.data.reservation.adminNotes, "Room needed for exam");
  });

  it("approving request A a second time returns 400", async () => {
    const res = await api("PATCH", `/reservations/${a._id}/status`, { cookie: adminCookie, body: { status: "approved" } });
    assert.equal(res.status, 400);
    assert.match(res.data.message, /Only pending reservations can be reviewed/);
  });

  it("faculty cannot review a reservation (403)", async () => {
    const res = await api("PATCH", `/reservations/${a._id}/status`, { cookie: facultyCookie, body: { status: "approved" } });
    assert.equal(res.status, 403);
  });
});