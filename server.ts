import express, { Request, Response } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import mockImageRecognition from "./data/mock-image-recognition.json";

const app = express();
const port = 4000;

// Configure middleware
app.use(express.json());
app.use(cors());

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Interface for Task
interface Task {
  uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
  compute_realogram: boolean;
  compute_shares: boolean;
}

// GET endpoint: /mock-image-recognition/tasks
app.get("/mock-image-recognition/tasks", (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = parseInt(req.query.offset as string) || 0;

  const paginatedItems = mockImageRecognition.items.slice(
    offset,
    offset + limit
  );

  res.status(200).json({
    items: paginatedItems,
    total: mockImageRecognition.items.length,
    limit,
    offset,
  });
});

// POST endpoint: /mock-image-recognition/tasks/:task_uuid/images
app.post(
  "/mock-image-recognition/tasks/:task_uuid/images",
  upload.array("images"),
  async (req: Request, res: Response): Promise<void> => {
    const { task_uuid } = req.params;
    const { callback } = req.body;

    // Validate task exists
    const taskExists = mockImageRecognition.items.some(
      (task) => task.uuid === task_uuid
    );
    if (!taskExists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    // Generate result UUIDs for each uploaded image
    const resultUuids = (req.files as Express.Multer.File[]).map(() =>
      uuidv4()
    );

    // Simulate async image recognition processing
    resultUuids.forEach((resultUuid, index) => {
      // Simulate processing delay
      setTimeout(() => {
        if (callback) {
          // Simulate sending callback
          try {
            // In a real implementation, use axios or fetch to send POST request
            console.log(
              `Sending callback to ${callback} for result ${resultUuid}`
            );
          } catch (error) {
            console.error(`Callback failed for ${resultUuid}:`, error);
          }
        }
      }, 2000 * (index + 1)); // Staggered delay for simulation
    });

    // Send response
    res.status(200).json(resultUuids);
  }
);

// GET endpoint: /mock-catalog-items
app.get(
  "/mock-catalog-items",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await fs.readFile(
        path.join(__dirname, "data", "mock-catalog-items.json"),
        "utf8"
      );
      const catalogData = JSON.parse(data);
      res.status(200).json(catalogData);
    } catch (error) {
      console.error("Error reading mock data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
