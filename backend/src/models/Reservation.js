import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      required: [true, "Choose a start time"],
    },
    endTime: {
      type: Date,
      required: [true, "Choose an end time"],
    },
    purpose: {
      type: String,
      required: [true, "Provide a purpose"],
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation