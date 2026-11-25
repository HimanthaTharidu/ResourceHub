
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseReservationTimer } from "../src/controllers/reservationController.js";

describe("Reservation Timer Unit Tests", () =>
{
    it("TDD_01: accepts valid future dates", () =>
    {
        const start = new Date(Date.now() + 86400000);
        const end = new Date(start.getTime() + 3600000);

        const result = parseReservationTimer(start.toISOString(), end.toISOString());

        assert.ok(!result.error);
        assert.ok(result.startTime instanceof Date);
        assert.ok(result.endTime instanceof Date);
    });

    it("TDD_02: rejects an invalid start date", () =>
    {
        const result = parseReservationTimer("invalid-date", new Date(Date.now() + 86400000).toISOString());

        assert.ok(result.error);
    });

    it("TDD_03: rejects an invalid end date", () =>
    {
        const result = parseReservationTimer(new Date(Date.now() + 86400000).toISOString(), "invalid-date");

        assert.ok(result.error);
    });

    it("TDD_04: rejects a past start time", () =>
    {
        const start = new Date(Date.now() - 3600000);
        const end = new Date(Date.now() + 3600000);

        const result = parseReservationTimer(start.toISOString(), end.toISOString());

        assert.ok(result.error);
    });

    it("TDD_05: rejects an end time before the start time", () =>
    {
        const start = new Date(Date.now() + 86400000);
        const end = new Date(start.getTime() - 3600000);

        const result = parseReservationTimer(start.toISOString(), end.toISOString());

        assert.ok(result.error);
    });

    it("TDD_06: rejects equal start and end times", () =>
    {
        const start = new Date(Date.now() + 86400000);

        const result = parseReservationTimer(start.toISOString(), start.toISOString());

        assert.ok(result.error);
    });
});
