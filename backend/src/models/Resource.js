import mongoose from "mongoose";
const categories = [
  "lecture_hall",
  "lecture_theatre",
  "auditorium",
  "projector",
  "computer_lab",
];

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a resource name"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please choose a category"],
      enum: {
        values: categories,
        message: "Please choose a valid resource category",
      },
    },
    capacity: {
      type: Number,
      min: 1,
      required: function () {
        // Capacity is only required if it's a Room or Lab
        return this.category === "Room" || this.category === "Lab";
      },
    },
    location: {
      type: String,
      required: [true, "Please specify a location"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    maintenanceNotes: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      ref: "Department",
      default: null,
    },
    //requiresApproval: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
