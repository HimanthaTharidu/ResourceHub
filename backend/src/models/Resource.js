import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a resource name"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please specify a category"],
      enum: ["Room", "Equipment", "Lab", "Other"],
    },
    capacity: {
      type: Number,
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
      required: [true, "Please specify the managing department"],
    },
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
