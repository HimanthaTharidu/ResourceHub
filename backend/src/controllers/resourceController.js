import Resource from "../models/Resource.js";

export async function createResource(req, res) {
  try {
    const {
      name,
      category,
      capacity,
      location,
      maintanenceNotes,
      department,
      createdBy,
    } = req.body;

    const resource = await Resource.create({
      name,
      category,
      capacity,
      location,
      maintanenceNotes,
      department,
      createdBy: req.user._id,
    });
    res.status(201).json({ resource });
  } catch (error) {
    console.log("create resource error", error);
    res.status(500).json({ message: "Server error while creating resource" });
  }
}

export async function getResource(req, res) {
  try {
    const { category, department, isAvailable } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (department) filter.department = department;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === true;

    const resources = await Resource.find(filter);
    res.status(200).json(resources);
  } catch (error) {
    console.log("Get Resource Error:", error);
    res.status(500).json({ message: "Server error while fetching resources" });
  }
}


export async function getResourceById(req, res) {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(resource);
  } catch (error) {
    console.error("Get Resource Error:", error);
    res.status(500).json({ message: "Server error while fetching resource" });
  }
}

export async function updateResource(req, res) {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      res.status(404).json({ message: "Resource not found" });
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.json(updatedResource);
  } catch (error) {
    console.error("Update Resource Error:", error);
    res.status(500).json({ message: "Server error while updating resource" });
  }
}

export async function deleteResource(req, res) {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    await resource.deleteOne();
    res.json({ message: "Resource removed successfully" });
  } catch (error) {
    console.error("Delete Resource Error:", error);
    res.status(500).json({ message: "Server error while deleting resource" });
  }
}
