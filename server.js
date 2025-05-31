const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");
const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

app.get("/mock-catalog-items", async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "data/mock-catalog-items.json"),
      "utf8"
    );
    const catalogData = JSON.parse(data);
    res.status(200).json(catalogData);
  } catch (error) {
    console.error("Error reading mock data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
