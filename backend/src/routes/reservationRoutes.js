import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createReservation,
  getMyReservations,
  getReservationById,
  updateMyReservation,
  cancelMyReservation,
  getAllReservations,
  setReservationStatus,
} from "../controllers/reservationController.js";

const router = express.Router();

router.route('/me')
    .get(protect, getMyReservations)

router.route('/')
    .get(protect, authorize("admin"), getAllReservations)
    .post(protect, createReservation)

router.route('/:id')
    .get(protect, getReservationById)
    .put(protect, updateMyReservation)
    .delete(protect, cancelMyReservation)

router.route('/:id/status')
    .patch(protect, authorize("admin"), setReservationStatus)

export default router;