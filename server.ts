import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware to parse JSON and handle multipart/form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log incoming requests
app.use((req: Request, res: Response, next: Function) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  console.log(`Query parameters: ${JSON.stringify(req.query)}`);
  next();
});

// Load mock data
const catalogItems = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/catalog-items.json"), "utf-8")
);
const irTasks = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/ir-tasks.json"), "utf-8")
);
let imageSubmissions = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/image-submissions.json"), "utf-8")
);

// Mock authentication middleware
app.use((req: Request, res: Response, next: Function) => {
  const authHeader = req.headers["x-api-key"];
  const apiKey = process.env.API_KEY;
  console.log(`Received x-api-key: ${authHeader}`); // Debug log
  if (!authHeader || !apiKey || authHeader !== apiKey) {
    console.log("Authentication failed: Invalid or missing x-api-key");
    return res.status(401).json({ detail: "Not authorized" });
  }
  next();
});

// GET /v2/catalog-items
app.get("/v2/catalog-items", (req: Request, res: Response) => {
  res.status(200).json({ items: catalogItems });
});

// GET /v2/image-recognition/tasks
app.get("/v2/image-recognition/tasks", (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  const paginatedTasks = irTasks.slice(offset, offset + limit);
  res.status(200).json({ items: paginatedTasks });
});

// POST /v2/image-recognition/tasks/{task_uuid}/images
app.post(
  "/v2/image-recognition/tasks/:task_uuid/images",
  (req: Request, res: Response) => {
    const { task_uuid } = req.params;
    if (!irTasks.find((task: any) => task.uuid === task_uuid)) {
      return res.status(404).json({ detail: "Task not found" });
    }

    const imageId = `img${Date.now()}`;
    const submission = {
      image_id: imageId,
      task_uuid,
      status: "pending",
      result: null,
    };

    imageSubmissions.push(submission);
    fs.writeFileSync(
      path.join(__dirname, "data/image-submissions.json"),
      JSON.stringify(imageSubmissions, null, 2)
    );

    // Simulate async processing
    setTimeout(() => {
      const updatedSubmission = imageSubmissions.find(
        (s: any) => s.image_id === imageId && s.task_uuid === task_uuid
      );
      if (updatedSubmission) {
        updatedSubmission.status = "completed";
        updatedSubmission.result = {
          recognized_items: [
            { item_id: "item1", confidence: 0.95 },
            { item_id: "item2", confidence: 0.85 },
          ],
        };
        fs.writeFileSync(
          path.join(__dirname, "data/image-submissions.json"),
          JSON.stringify(imageSubmissions, null, 2)
        );
      }
    }, 5000); // 5-second delay to mimic processing

    // Return array with image_id to match frontend expectation
    res.status(200).json([imageId]);
  }
);

// GET /v2/image-recognition/tasks/{task_uuid}/images/{image_id}
app.get(
  "/v2/image-recognition/tasks/:task_uuid/images/:image_id",
  (req: Request, res: Response) => {
    const { task_uuid, image_id } = req.params;
    const submission = imageSubmissions.find(
      (s: any) => s.image_id === image_id && s.task_uuid === task_uuid
    );
    if (!submission) {
      return res.status(404).json({ detail: "Image submission not found" });
    }
    res.status(200).json(submission);
  }
);

// Catch-all for undefined routes
app.use((req: Request, res: Response) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ detail: "Not Found" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
});
