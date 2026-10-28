import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import Resource from "../models/Resource.js";

const conflictingStatuses = ["pending", "approved"];

function parseReservationTimer(startValue, endValue) {
  const startTime = new Date(startValue);
  const endTime = new Date(endValue);

  if (
    !startTime ||
    !endTime ||
    Number.isNaN(startTime.getTime()) ||
    Number.isNaN(endTime.getTime())
  ) {
    return { error: "Please provide valid start and end times" };
  }

  if (startTime <= new Date()) {
    return { error: "The reservation must start in the future" };
  }

  if (endTime <= startTime) {
    return { error: "End time must be later than start time" };
  }

  return { startTime, endTime };
}

async function hasConflict(resourceId, startTime, endTime, excludeId) {
  const filter = {
    resource: resourceId,
    status: { $in: ["pending", "approved"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return Boolean(await Reservation.exists(filter));
}

async function getAvailableResources(resourceId) {
  if (!mongoose.isValidObjectId(resourceId)) {
    return null;
  }

  return Resource.findOne({ _id: resourceId, isAvailable: true });
}

export async function createReservation(req, res) {
  const {
    resourceId,
    startTime: startValue,
    endTime: endValue,
    purpose,
  } = req.body;

  const times = parseReservationTimer(startValue, endValue);

  try {
    if (times.error) {
      return res.status(400).json({ message: times.error });
    }
    if (!purpose?.trim()) {
      return res.status(400).json({ message: "Please provide a purpose" });
    }

    const resource = await getAvailableResources(resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Available resource not found" });
    }

    if (await hasConflict(resource._id, times.startTime, times.endTime)) {
      return res.status(409).json({
        message: "This resource already has a reservation during that time",
      });
    }

    const reservation = await Reservation.create({
      resource: resource._id,
      requestedBy: req.user._id,
      startTime: times.startTime,
      endTime: times.endTime,
      purpose: purpose.trim(),
    });

    await reservation.populate("resource", "name category location");
    return res.status(201).json({ reservation });
  } catch (error) {
    console.error("Create reservation error:", error);
    return res.status(500).json({ message: "Could not create reservation" });
  }
}

export async function getAllReservations(req, res) {
  try {
    const reservations = await Reservation.find()
      .populate("resource", "name category location")
      .populate("requestedBy", "name email department")
      .sort({ createdAt: -1 });

    return res.status(200).json({ reservations });
  } catch (error) {
    console.error("Get my reservation error:", error);
    return res.status(500).json({ message: "Could not load reservation" });
  }
}

export async function getMyReservations(req, res) {
  try {
    const reservations = await Reservation.find({
      requestedBy: req.user._id,
    })
      .populate("resource", "name category location")
      .sort({ createdAt: -1 });

    return res.status(200).json({ reservations });
  } catch (error) {
    console.error("Get my reservations error:", error);
    return res
      .status(500)
      .json({ message: "Could not load your reservations" });
  }
}

export async function getReservationById(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const reservation = await Reservation.findById(req.params.id)
      .populate("resource", "name category location")
      .populate("requestedBy", "name email department")
      .sort({ createdAt: -1 });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    const requesterId = reservation.requestedBy?._id ?? reservation.requestedBy;
    const isOwner = requesterId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isOwner) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    return res.status(200).json({ reservation });
  } catch (error) {
    console.error("Get my reservations error:", error);
    return res.status(500).json({ message: "Could not load reservations" });
  }
}

export async function setReservationStatus(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const { status, adminNotes = "" } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected",
      });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status !== "pending") {
      return res.status(400).json({
        message: "Only pending reservations can be reviewed",
      });
    }

    if (
      status === "approved" &&
      (await hasConflict(
        reservation.resource,
        reservation.startTime,
        reservation.endTime,
        reservation._id,
      ))
    ) {
      return res.status(409).json({
        message: "Another reservation conflicts with this time",
      });
    }

    reservation.status = status;
    reservation.adminNotes = String(adminNotes).trim();
    await reservation.save();

    return res.status(200).json({ reservation });
  } catch (error) {
    console.error("Review reservation error:", error);
    return res.status(500).json({ message: "Could not review reservation" });
  }
}

export async function cancelMyReservation(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const reservation = await Reservation.findOne({
      _id: req.params.id,
      requestedBy: req.user.id,
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status !== "pending") {
      return res.status(400).json({
        message: "Only pending reservations can be cancelled",
      });
    }

    reservation.status = "cancelled";
    await reservation.save();

    return res.status(200).json({ reservation });
  } catch (error) {
    console.error("Cancel reservation error:", error);
    return res.status(500).json({ message: "Could not cancel reservation" });
  }
}

export async function updateMyReservation(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const reservation = await Reservation.findOne({
      _id: req.params.id,
      requestedBy: req.user._id,
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status !== "pending") {
      return res.status(400).json({
        message: "Only pending reservations can be edited",
      });
    }

    const resourceId = req.body.resourceId || reservation.resource;
    const startValue = req.body.startTime ?? reservation.startTime;
    const endValue = req.body.endTime ?? reservation.endTime;
    const purpose = req.body.purpose ?? reservation.purpose;

    const times = parseReservationTimer(startValue, endValue);
    if (times.error) {
      return res.status(400).json({ message: times.error });
    }

    if (!purpose?.trim()) {
      return res.status(400).json({ message: "Please provide a purpose" });
    }

    const resource = await getAvailableResources(resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Available resource not found" });
    }

    if (
      await hasConflict(
        resource._id,
        times.startTime,
        times.endTime,
        reservation._id,
      )
    ) {
      return res.status(409).json({
        message: "This resource already has a reservation during that time",
      });
    }

    reservation.resource = resource._id;
    reservation.startTime = times.startTime;
    reservation.endTime = times.endTime;
    reservation.purpose = purpose.trim();

    await reservation.save();
    await reservation.populate("resource", "name category location");

    return res.status(200).json({ reservation });
  } catch (error) {
    console.error("Update reservation error:", error);
    return res.status(500).json({ message: "Could not update reservation" });
  }
}
