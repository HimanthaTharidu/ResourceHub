import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Resource from "../src/models/Resource.js";

describe("TDD: Resource capacity validation", () => {

  it("TDD_001: should reject zero capacity", async () => {
    const resource = new Resource({
      name: "Computer Lab TDD",
      category: "computer_lab",
      capacity: 0,
      location: "Engineering Building",
      createdBy: "507f1f77bcf86cd799439011",
    });

    await assert.rejects(
      resource.validate(),
      /Capacity must be greater than zero/
    );
  });

});
