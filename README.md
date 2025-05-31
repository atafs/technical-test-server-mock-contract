````markdown
# Neurolabs Mock Server

This mock server simulates the Neurolabs Staging API (`https://staging.api.neurolabs.ai/`) for the Frontend Engineer Technical Test. It provides endpoints to test catalog visualization and image recognition task submission functionality when the staging API is unavailable.

## Purpose

- Replicates the API schema for the Neurolabs Frontend Test.
- Serves mock data from JSON files in `data/`.
- Simulates asynchronous image processing with a 5-second delay.
- Allows easy switching between the mock server and the staging API via the main project's proxy configuration.

## Prerequisites

- **Node.js**: Version 18 or higher.
- **npm**: For installing dependencies.
- **Main Project**: The React frontend in `../react-root/` (e.g., `neurolabs-test/`), configured to proxy API requests to `http://localhost:3001`.

## Setup

1. **Navigate to the Mock Server Directory**:
   ```bash
   cd mock-server
   ```
````

2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Verify Mock Data**:
   - Ensure the `data/` directory contains:
     - `catalog-items.json`: Mock catalog items.
     - `ir-tasks.json`: Mock image recognition tasks.
     - `image-submissions.json`: Mock image submission records.
   - These files must contain valid JSON (see [Mock Data](#mock-data)).
4. **Start the Mock Server**:
   ```bash
   npm start
   ```
   - Runs on `http://localhost:3001` using `nodemon` for auto-reloading.
   - Expected output:
     ```
     [nodemon] starting `ts-node server.ts`
     Mock server running on http://localhost:3001
     ```

## Mock Data

Mock data is stored in `data/` as JSON files:

- **catalog-items.json**:
  - Contains catalog items with properties like `id`, `name`, `thumbnail`, `status`, and optional fields (`description`, `category`, etc.).
  - Example:
    ```json
    [
      {
        "id": "item1",
        "name": "Cola Bottle",
        "thumbnail": "http://example.com/thumbs/cola.jpg",
        "status": "capture",
        "description": "500ml plastic bottle of cola",
        "category": "beverage",
        "created_at": "2025-05-30T10:00:00Z",
        "updated_at": "2025-05-31T12:00:00Z",
        "metadata": {
          "sku": "COLA500",
          "brand": "Generic",
          "weight": 500,
          "dimensions": {
            "width": 6.5,
            "height": 25,
            "depth": 6.5
          }
        },
        "image_count": 10
      },
      ...
    ]
    ```
- **ir-tasks.json**:
  - Lists image recognition tasks with `uuid` and `name`.
  - Example:
    ```json
    [
      {
        "uuid": "task1",
        "name": "Beverage Recognition Task"
      },
      ...
    ]
    ```
- **image-submissions.json**:
  - Stores image submission records, updated dynamically by `POST` requests.
  - Example:
    ```json
    [
      {
        "image_id": "img1",
        "task_uuid": "task1",
        "status": "pending",
        "result": null
      },
      ...
    ]
    ```

## API Endpoints and Testing

The mock server replicates the Neurolabs API schema. All endpoints require an `Authorization: Bearer <token>` header (any token is accepted, e.g., `dummy-key`). Use `curl` to test endpoints.

### 1. GET /v2/catalog-items

- **Description**: Retrieves the list of catalog items.
- **Response**: `200 OK` with an array of catalog items.
- **curl Command**:
  ```bash
  curl -H "Authorization: Bearer dummy-key" http://localhost:3001/v2/catalog-items
  ```
- **Example Response**:
  ```json
  [
    {
      "id": "item1",
      "name": "Cola Bottle",
      "thumbnail": "http://example.com/thumbs/cola.jpg",
      "status": "capture",
      "description": "500ml plastic bottle of cola",
      "category": "beverage",
      "created_at": "2025-05-30T10:00:00Z",
      "updated_at": "2025-05-31T12:00:00Z",
      "metadata": {
        "sku": "COLA500",
        "brand": "Generic",
        "weight": 500,
        "dimensions": {
          "width": 6.5,
          "height": 25,
          "depth": 6.5
        }
      },
      "image_count": 10
    },
    {
      "id": "item2",
      "name": "Chips Packet",
      "thumbnail": "http://example.com/thumbs/chips.jpg",
      "status": "active",
      ...
    }
  ]
  ```
- **Notes**: Used by `CatalogView` to display items, with `status: "capture"` highlighted.

### 2. GET /v2/image-recognition/tasks

- **Description**: Retrieves the list of image recognition tasks.
- **Response**: `200 OK` with an array of tasks.
- **curl Command**:
  ```bash
  curl -H "Authorization: Bearer dummy-key" http://localhost:3001/v2/image-recognition/tasks
  ```
- **Example Response**:
  ```json
  [
    {
      "uuid": "task1",
      "name": "Beverage Recognition Task"
    },
    {
      "uuid": "task2",
      "name": "Snack Recognition Task"
    }
  ]
  ```
- **Notes**: Used by `IRTaskView` to populate the task selection dropdown.

### 3. POST /v2/image-recognition/tasks/{task_uuid}/images

- **Description**: Submits an image to a task, simulating recognition processing with a 5-second delay.
- **Request Body**: `multipart/form-data` with an `image` field.
- **Response**: `200 OK` with submission details.
- **curl Command**:
  ```bash
  curl -H "Authorization: Bearer dummy-key" -X POST \
    -F "image=@/path/to/test.jpg" \
    http://localhost:3001/v2/image-recognition/tasks/task1/images
  ```
  - Replace `/path/to/test.jpg` with a valid image file path (e.g., `~/test.jpg`).
- **Example Response** (immediately after submission):
  ```json
  {
    "image_id": "img1234567890",
    "task_uuid": "task1",
    "status": "pending",
    "result": null
  }
  ```
- **Notes**:
  - After 5 seconds, the submission updates to `status: "completed"` with mock recognition results.
  - Updates `image-submissions.json` dynamically.
  - Used by `IRTaskView` for image uploads.

### 4. GET /v2/image-recognition/tasks/{task_uuid}/images/{image_id}

- **Description**: Retrieves the status and results of an image submission.
- **Response**: `200 OK` with submission details.
- **curl Command**:
  ```bash
  curl -H "Authorization: Bearer dummy-key" \
    http://localhost:3001/v2/image-recognition/tasks/task1/images/img1234567890
  ```
- **Example Response** (after 5-second processing):
  ```json
  {
    "image_id": "img1234567890",
    "task_uuid": "task1",
    "status": "completed",
    "result": {
      "recognized_items": [
        {
          "item_id": "item1",
          "confidence": 0.95
        },
        {
          "item_id": "item2",
          "confidence": 0.85
        }
      ]
    }
  }
  ```
- **Notes**: Used by `TaskStatusDisplay` to poll submission status.

### Error Responses

- **401 Unauthorized**:
  - Missing or invalid `Authorization` header.
  - Example:
    ```bash
    curl http://localhost:3001/v2/catalog-items
    ```
    Response:
    ```json
    { "error": "Unauthorized" }
    ```
- **404 Not Found**:
  - Invalid `task_uuid` or `image_id`.
  - Example:
    ```bash
    curl -H "Authorization: Bearer dummy-key" http://localhost:3001/v2/image-recognition/tasks/invalid/images/img1
    ```
    Response:
    ```json
    { "error": "Task not found" }
    ```

## Integration with Main Project

1. **Update Proxy**:
   - In the main project's `package.json` (e.g., `../neurolabs-test/package.json`):
     ```json
     "proxy": "http://localhost:3001/"
     ```
2. **Set API Key**:
   - In `../neurolabs-test/.env`:
     ```env
     REACT_APP_API_KEY=dummy-key
     ```
3. **Run Both Servers**:
   - Start the mock server:
     ```bash
     cd mock-server
     npm start
     ```
   - Start the React app in a new terminal:
     ```bash
     cd ../neurolabs-test
     npm start
     ```
   - Open `http://localhost:3000` to test the app with the mock server.
4. **Switch to Staging API**:
   - When the staging API is available, update the proxy:
     ```json
     "proxy": "https://staging.api.neurolabs.ai/"
     ```
   - Use the real API key in `.env`:
     ```env
     REACT_APP_API_KEY=your_real_api_key
     ```

## Troubleshooting

- **Server Crashes**:
  - Check `data/*.json` files for valid JSON.
  - Ensure dependencies are installed (`npm install`).
  - Verify `server.ts` matches the provided implementation.
- **curl Connection Errors**:
  - Ensure the server is running (`npm start`).
  - Check `http://localhost:3001` is accessible.
- **Vulnerabilities**:
  - Run `npm audit fix` to address issues:
    ```bash
    npm audit fix
    ```
  - If unresolved, note in submission that vulnerabilities don't impact test functionality.

## Submission

- Include `mock-server/` in the project ZIP:
  ```bash
  cd ../neurolabs-test
  zip -r neurolabs-test.zip . -x "node_modules/*" "build/*" "mock-server/node_modules/*"
  ```
- Ensure `data/`, `server.ts`, and `package.json` are included.

## Notes

- The mock server accepts any `Bearer` token for simplicity.
- Image processing is simulated with a 5-second delay to mimic real API behavior.
- Mock data can be extended by adding entries to `data/*.json`.
- Tested as of May 31, 2025, 03:54 PM BST.

## Releases and Notes

### Localhost server

- Task 1: https://github.com/atafs/technical-test-server-mock-contract/releases/tag/task1

- Task2: https://github.com/atafs/technical-test-server-mock-contract/releases/tag/task2

```

```
