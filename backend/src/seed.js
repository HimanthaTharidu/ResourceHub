import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Resource from "./models/Resource.js";
import Reservation from "./models/Reservation.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  await Promise.all([
    Reservation.deleteMany({}),
    Resource.deleteMany({}),
    User.deleteMany({}),
  ]);

  // User.create (not insertMany) so the pre("save") hook hashes the passwords
  const admin = await User.create({
    name: "Admin User",
    email: "admin@resourcehub.test",
    password: "admin123",
    role: "admin",
    department: "Electrical and Information Engineering",
  });

  const faculty = await User.create({
    name: "Dr. Nimal Perera",
    email: "faculty@resourcehub.test",
    password: "faculty123",
    role: "faculty",
    department: "Electrical and Information Engineering",
  });

  const resources = await Resource.create([
    { name: "Lecture Hall A", category: "lecture_hall", capacity: 120, location: "Main Building, Floor 1", department: null, createdBy: admin._id },
    { name: "Lecture Hall B", category: "lecture_hall", capacity: 80, location: "Main Building, Floor 2", department: "Electrical and Information Engineering", createdBy: admin._id },
    { name: "Lecture Theatre 1", category: "lecture_theatre", capacity: 250, location: "Engineering Block", department: null, createdBy: admin._id },
    { name: "Main Auditorium", category: "auditorium", capacity: 600, location: "Central Complex", department: null, createdBy: admin._id },
    { name: "Computer Lab 1", category: "computer_lab", capacity: 40, location: "IT Building, Floor 1", department: "Electrical and Information Engineering", createdBy: admin._id },
    { name: "Portable Projector 1", category: "equipment", location: "Equipment Store", department: null, createdBy: admin._id },
    { name: "Portable Projector 2", category: "equipment", location: "Equipment Store", department: null, isAvailable: false, maintenanceNotes: "Lamp replacement in progress", createdBy: admin._id },
  ]);

  // A few sample reservations relative to today (8:00-10:00 AM slots)
  const slot = (daysAhead, startHour, endHour) => {
    const start = new Date();
    start.setDate(start.getDate() + daysAhead);
    start.setHours(startHour, 0, 0, 0);
    
    const end = new Date(start);
    end.setHours(endHour);
    return { startTime: start, endTime: end };
  };

  await Reservation.create([
    { resource: resources[0]._id, requestedBy: faculty._id, ...slot(1, 8, 10), purpose: "Machine Learning lecture", status: "pending" },
    { resource: resources[4]._id, requestedBy: faculty._id, ...slot(2, 13, 15), purpose: "Programming lab session", status: "approved", adminNotes: "Approved" },
    { resource: resources[3]._id, requestedBy: faculty._id, ...slot(5, 9, 12), purpose: "Department seminar", status: "rejected", adminNotes: "Clashes with university event" },
  ]);

  console.log("Seeded successfully");
  console.log("Admin:   admin@resourcehub.test / admin123");
  console.log("Faculty: faculty@resourcehub.test / faculty123");

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("Seeding failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});