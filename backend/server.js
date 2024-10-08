const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const { rateLimit } = require("express-rate-limit");

const jwt = require("jsonwebtoken");
require("dotenv").config();

// This is for processing file uploads
const upload = multer({ dest: "uploads/" });

const corsOptions = {
  origin: "https://glimpse-frontend.onrender.com",
  optionsSuccessStatus: 200,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
//app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});

const loginLimiter = rateLimit({
  // How long to remember requests
  windowMs: 15 * 60 * 1000,
  // Max number of requests per IP
  max: 100,
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
});

app.use("/login", loginLimiter);

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// An actual auth token we check.
const authenticateToken = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Dummy login function to emulate auth.
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const accessToken = jwt.sign({ username: username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ accessToken: accessToken });
});

// This endpoint retrieves all the data in the database.
app.get("/data", authenticateToken, async (req, res) => {
  const { source, interest_level, status } = req.query;

  let queryText = "SELECT * FROM glimpse WHERE 1=1";
  const queryParams = [];

  if (source) {
    queryParams.push(source);
    queryText += ` AND source = $${queryParams.length}`;
  }

  if (interest_level) {
    queryParams.push(interest_level);
    queryText += ` AND interest_level = $${queryParams.length}`;
  }

  if (status) {
    queryParams.push(status);
    queryText += ` AND status = $${queryParams.length}`;
  }

  try {
    const result = await pool.query(queryText, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to retrieve data" });
  }
});

// This endpoint uploads the CSV file to the database.
app.post("/upload", upload.single("csvFile"), (req, res) => {
  const filePath = req.file.path;
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      const convertedData = {
        lead_id: data["Lead ID"],
        lead_name: data["Lead Name"],
        contact_info: data["Contact Information"],
        source: data["Source"],
        interest_level: data["Interest Level"],
        status: data["Status"],
        assigned_salesperson: data["Assigned Salesperson"],
      };
      results.push(convertedData);
    })
    .on("end", async () => {
      try {
        for (let row of results) {
          const values = [
            row.lead_id,
            row.lead_name,
            row.contact_info,
            row.source,
            row.interest_level,
            row.status,
            row.assigned_salesperson,
          ];
          /*const queryText = `
          INSERT INTO glimpse (lead_id, lead_name, contact_info, source, interest_level, status, assigned_salesperson)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;*/
          const queryText = `
  INSERT INTO glimpse (lead_id, lead_name, contact_info, source, interest_level, status, assigned_salesperson)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  ON CONFLICT (lead_id) DO NOTHING
`;

          await pool.query(queryText, [
            row.lead_id,
            row.lead_name,
            row.contact_info,
            row.source,
            row.interest_level,
            row.status,
            row.assigned_salesperson,
          ]);
        }
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
      "INSERT INTO glimpse (name, email) VALUES($1, $2) RETURNING *",
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

// Delete a lead from the database
app.delete("/data/:id", authenticateToken, async (req, res) => {});

// Delete all leads from the database
app.delete("/data", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM glimpse");

    res.status(200).json({ message: "All leads deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error deleting all leads" });
  }
});

app.listen(5000, () => {
  console.log("Server has started on port 5000");
});
