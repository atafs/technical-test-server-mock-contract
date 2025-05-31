# technical-test-server-mock-contract

````markdown
# Mock Catalog Server

This is a Node.js-based mock server designed to support the **Catalog Web Application**, a React + TypeScript project that displays a catalog of items. The server provides a RESTful API endpoint to serve mock catalog item data, which is consumed by the front-end application to visualize items with thumbnails, names, and statuses (e.g., `capture`, `active`, `inactive`).

## Purpose

The server simulates a backend API for the catalog application, returning a JSON response with item details such as `uuid`, `name`, `thumbnail_url`, and `status`. It’s used for development and testing, enabling the front-end to fetch and display catalog data without a real backend.

Key features:

- Serves a single endpoint: `GET /mock-catalog-items`
- Returns a JSON array of items with fields like `uuid`, `name`, `thumbnail_url`, `status`, and more
- Optionally serves static images from a local directory (e.g., `/images`)
- Supports the front-end’s pulse animation content loader during data fetching

## Prerequisites

Before running the server, ensure you have:

- **Node.js** (v16 or higher): [Download Node.js](https://nodejs.org/)
- **npm** (included with Node.js) or **Yarn** (optional)
- A code editor (e.g., VS Code) for editing server files

## How to Run

1. **Start the Server**:
   Run the server using Node.js:
   ```bash
   node server.js
   ```
````

Or, with `nodemon`:

```bash
npm run dev
```

The server starts on `http://localhost:4000`.

2. **Access the Endpoint**:
   Use a browser, `curl`, or Postman to access:

   ```
   http://localhost:4000/mock-catalog-items
   ```

   This returns a JSON response with catalog items.

3. **Verify with the Front-End**:
   Ensure the React app (e.g., on `http://localhost:3000`) fetches data from `http://localhost:4000/mock-catalog-items`. The front-end’s `catalogService.ts` transforms the data (e.g., `uuid` to `id`, `status` mappings).

## Scripts

Add these scripts to `package.json`:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

- `npm start`: Runs the server in production mode.
- `npm run dev`: Runs with `nodemon` for development (auto-restarts on changes).

## How It Works

### Endpoint

- **GET /mock-catalog-items**:
  - **Response**: A JSON object with:
    - `items`: Array of catalog items with `uuid`, `name`, `thumbnail_url`, `status`, etc.
    - `total`: Total

### Release

https://github.com/atafs/technical-test-server-mock-contract/releases/tag/task1_mock_be
