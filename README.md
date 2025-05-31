````markdown
# Catalog Visualization Project

This project consists of a React + TypeScript front-end (FE) and a Node.js mock server back-end (BE). The FE displays a catalog of items with thumbnails, names, and statuses, highlighting `capture` items, and uses a pulse animation skeleton loader. The BE serves mock catalog data via a REST API.

## Prerequisites

- **Node.js** (v16+): [Download Node.js](https://nodejs.org/)
- **npm** or **Yarn**
- Code editor (e.g., VS Code)

## Back-End (BE) Setup

1. **Navigate to BE Directory**:
   ```bash
   cd mock-catalog-server
   ```
````

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Run the BE**:

   ```bash
   node server.js
   ```

   The server runs at `http://localhost:4000`. Access `http://localhost:4000/mock-catalog-items` to verify.

## Notes

- **FE Dependencies**: The FE fetches data from `http://localhost:4000/mock-catalog-items`. Start the BE first.
- **Troubleshooting**:
  - FE: Check console logs for errors (`Fetched items`). Clear cache if needed: `rm -rf node_modules/.cache`.
  - BE: Ensure port 4000 is free. Test endpoint with `curl http://localhost:4000/mock-catalog-items`.
- **Data**: The BE serves JSON with `uuid`, `thumbnail_url`, etc. The FE transforms `uuid` to `id` and maps statuses.

---

_Generated on May 31, 2025_

```

```
