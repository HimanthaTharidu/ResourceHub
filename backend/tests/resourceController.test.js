import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import Resource from "../src/models/Resource.js";
import { createResource } from "../src/controllers/resourceController.js";

function createMockResponse() {
  return {
    statusCode: null,
    responseBody: null,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(data) {
      this.responseBody = data;
      return this;
    },
  };
}

describe("White-box testing: createResource()", () => {

  it("WB_001: creates resource with department", async () => {
    const originalCreate = Resource.create;

    Resource.create = async (data) => data;

    try {
      const req = {
        body: {
          name: "Computer Lab A",
          category: "computer_lab",
          capacity: 120,
          location: "Engineering Building",
          department: "EIE123",
        },
        user: { _id: "admin123" },
      };

      const res = createMockResponse();

      await createResource(req, res);

      assert.equal(res.statusCode, 201);
      assert.equal(res.responseBody.resource.department, "EIE123");
      assert.equal(res.responseBody.resource.createdBy, "admin123");
    } finally {
      Resource.create = originalCreate;
    }
  });

  it("WB_002: creates resource without department", async () => {
    const originalCreate = Resource.create;

    Resource.create = async (data) => data;

    try {
      const req = {
        body: {
          name: "Projector",
          category: "equipment",
          location: "Store",
        },
        user: { _id: "admin123" },
      };

      const res = createMockResponse();

      await createResource(req, res);

      assert.equal(res.statusCode, 201);
      assert.equal(res.responseBody.resource.department, null);
    } finally {
      Resource.create = originalCreate;
    }
  });

  it("WB_003: handles Mongoose validation error", async () => {
    const originalCreate = Resource.create;

    Resource.create = async () => {
      const error = new Error("Please add a resource name");
      error.name = "ValidationError";
      error.errors = {
        name: { message: "Please add a resource name" },
      };
      throw error;
    };

    try {
      const req = {
        body: {},
        user: { _id: "admin123" },
      };

      const res = createMockResponse();

      await createResource(req, res);

      assert.equal(res.statusCode, 400);
      assert.match(res.responseBody.message, /resource name/i);
    } finally {
      Resource.create = originalCreate;
    }
  });

  it("WB_004: handles unexpected server error", async () => {
    const originalCreate = Resource.create;
    const originalLog = console.log;

    Resource.create = async () => {
      throw new Error("Database connection failed");
    };

    console.log = () => {};

    try {
      const req = {
        body: {},
        user: { _id: "admin123" },
      };

      const res = createMockResponse();

      await createResource(req, res);

      assert.equal(res.statusCode, 500);
      assert.equal(
        res.responseBody.message,
        "Server error while creating resource"
      );
    } finally {
      Resource.create = originalCreate;
      console.log = originalLog;
    }
  });

});
