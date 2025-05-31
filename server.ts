import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import mockData from "./data/mock-data.json";

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

// Interface for Result Status
interface ResultStatus {
  task_uuid: string;
  result_uuid: string;
  status: "pending" | "completed" | "failed";
  created_at: string;
}

// In-memory store for result statuses
const resultStatuses = new Map<string, ResultStatus>();

// Multer error handling middleware
const handleMulterError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    console.error(`Multer error: ${err.message}, field: ${err.field}`);
    res.status(400).json({ error: `Multer error: ${err.message}` });
    return;
  }
  next(err);
};

// GET endpoint: /mock-image-recognition/tasks
app.get("/mock-image-recognition/tasks", (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = parseInt(req.query.offset as string) || 0;

  const paginatedItems = mockData.items.slice(offset, offset + limit);
  const responseData = {
    items: paginatedItems,
    total: mockData.items.length,
    limit,
    offset,
  };

  console.log(
    "GET /mock-image-recognition/tasks response:",
    JSON.stringify(responseData, null, 2)
  );

  res.status(200).json(responseData);
});

// POST endpoint: /mock-image-recognition/tasks/:task_uuid/images
app.post(
  "/mock-image-recognition/tasks/:task_uuid/image",
  (req: Request, res: Response, next: NextFunction) => {
    // Log incoming form-data fields for debugging
    console.log("Incoming form-data fields:", req.body, req.files);
    next();
  },
  upload.array("images"),
  handleMulterError,
  async (req: Request, res: Response): Promise<void> => {
    const { task_uuid } = req.params;
    const { callback } = req.body;

    // Validate task exists
    const taskExists = mockData.items.some((task) => task.uuid === task_uuid);
    if (!taskExists) {
      console.log(
        `POST /mock-image-recognition/tasks/${task_uuid}/images error: Task not found`
      );
      res.status(404).json({ error: "Task not found" });
      return;
    }

    // Generate result UUIDs for each uploaded image
    const resultUuids = (req.files as Express.Multer.File[]).map(() => {
      const resultUuid = uuidv4();
      resultStatuses.set(resultUuid, {
        task_uuid,
        result_uuid: resultUuid,
        status: "pending",
        created_at: new Date().toISOString(),
      });
      return resultUuid;
    });

    // Simulate async image recognition processing
    resultUuids.forEach((resultUuid, index) => {
      setTimeout(() => {
        resultStatuses.set(resultUuid, {
          task_uuid,
          result_uuid: resultUuid,
          status: "completed",
          created_at: resultStatuses.get(resultUuid)!.created_at,
        });

        if (callback) {
          const resultPayload = resultStatuses.get(resultUuid);
          console.log(
            `Simulating callback POST to ${callback} for result ${resultUuid}:`,
            JSON.stringify(resultPayload, null, 2)
          );
        }
      }, 2000 * (index + 1));
    });

    console.log(
      `POST /mock-image-recognition/tasks/${task_uuid}/images response:`,
      JSON.stringify(resultUuids, null, 2)
    );

    res.status(200).json(resultUuids);
  }
);

// GET endpoint: /v2/image-recognition/tasks/:task_uuid/results/:result_uuid
app.get(
  "/v2/image-recognition/tasks/:task_uuid/results/:result_uuid",
  (req: Request, res: Response): void => {
    const { task_uuid, result_uuid } = req.params;

    const taskExists = mockData.items.some((task) => task.uuid === task_uuid);
    if (!taskExists) {
      console.log(
        `GET /v2/image-recognition/tasks/${task_uuid}/results/${result_uuid} error: Task not found`
      );
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const resultStatus = resultStatuses.get(result_uuid);
    if (!resultStatus || resultStatus.task_uuid !== task_uuid) {
      console.log(
        `GET /v2/image-recognition/tasks/${task_uuid}/results/${result_uuid} error: Result not found`
      );
      res.status(404).json({ error: "Result not found" });
      return;
    }

    console.log(
      `GET /v2/image-recognition/tasks/${task_uuid}/results/${result_uuid} response:`,
      JSON.stringify(resultStatus, null, 2)
    );

    res.status(200).json(resultStatus);
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

      console.log(
        "GET /mock-catalog-items response:",
        JSON.stringify(catalogData, null, 2)
      );

      res.status(200).json(catalogData);
    } catch (error) {
      console.error("Error reading mock-catalog-items.json:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
