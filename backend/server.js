const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const jwt = require("jsonwebtoken");
require("dotenv").config();

// This is for processing file uploads
const upload = multer({ dest: "uploads/" });

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  database: "glimpse",
  password: "honey4",
  port: "5432",
});

// An actual auth token we check.
const authenticateToken = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Dummy login function to emulate auth.
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const accessToken = jwt.sign(
    { username: username },
    process.env.ACCESS_TOKEN_SECRET
  );
  res.json({ accessToken: accessToken });
});

// This endpoint retrieves all the data in the database.
app.get("/data", authenticateToken, async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM glimpse");
    res.json(users.rows);
  } catch (error) {
    console.log(error);
    console.error(error.message);
  }
});

// This endpoint uploads the CSV file to the database.
app.post("/upload", upload.single("csvFile"), (req, res) => {
  console.log(req.file);
  console.log(req.body);
  const filePath = req.file.path;
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        await pool.connect();
        const client = await pool.connect();

        for (let row of results) {
          const queryText =
            "INSERT INTO your_table(column1, column2) VALUES($1, $2)";
          await client.query(queryText, [row.column1, row.column2]);
        }

        client.release();
        res
          .status(200)
          .json({ message: "File successfully processed and data inserted" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to insert data" });
      } finally {
        fs.unlinkSync(filePath);
      }
    });
});

// Can insert something into the database if we so desire.
app.post("/data", authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const newUser = await pool.query(
      "INSERT INTO users (name, email) VALUES($1, $2) RETURNING *",
      [name, email]
    );
    res.json(newUser.rows[0]);
  } catch (error) {
    console.log(error);
    console.error(error.message);
  }
});

// Just in case we want to build this functionality out in the future.
app.put("/data/:id", authenticateToken, async (req, res) => {});

app.delete("/data/:id", authenticateToken, async (req, res) => {});

app.listen(5000, () => {
  console.log("Server has started on port 5000");
});
