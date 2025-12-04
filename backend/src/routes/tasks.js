import express from "express";
import { prisma } from "../prismaClient.js";

const router = express.Router();

// Create Task
router.post("/", async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || "TO_DO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return res.status(201).json(task);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create task" });
  }
});

// Get Tasks with filters and search
router.get("/", async (req, res) => {
  try {
    const { status, priority, dueDate, search } = req.query;

    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (dueDate) {
      const date = new Date(dueDate);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      where.dueDate = {
        gte: date,
        lt: nextDay,
      };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json(tasks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Get single task
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: "Task not found" });
    return res.json(task);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch task" });
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, status, priority, dueDate } = req.body;

    const exists = await prisma.task.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: "Task not found" });

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: title ?? exists.title,
        description: description !== undefined ? description : exists.description,
        status: status || exists.status,
        priority: priority || exists.priority,
        dueDate:
          dueDate === null
            ? null
            : dueDate
            ? new Date(dueDate)
            : exists.dueDate,
      },
    });

    return res.json(task);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const exists = await prisma.task.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: "Task not found" });

    await prisma.task.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;


