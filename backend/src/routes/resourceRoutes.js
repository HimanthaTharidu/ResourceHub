import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { createResource, getResource, getResourceById, updateResource, deleteResource } from "../controllers/resourceController.js";

const router = express.Router();

router.route('/')
    .get(protect, getResource)
    .post(protect, authorize("admin"), createResource)

router.route('/:id')
    .get(protect, getResourceById)
    .delete(protect, authorize("admin"), deleteResource)
    .put(protect, authorize("admin"), updateResource)
    
export default router