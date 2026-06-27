import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new sqlite3.Database(
  path.join(__dirname, "../scraper/news_pulse.db")
);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "News Pulse Backend Running"
  });
});

app.get("/articles", (req, res) => {
    
    db.all(
        `
    SELECT id, title, source, published
    FROM articles
    ORDER BY id DESC
    LIMIT 50
    `,
    [],
    (err, rows) => {
        
        if (err) {
            return res.status(500).json({
                error: err.message
        });
      }
      
      res.json(rows);
      
    }
);

});
app.get("/clusters", (req, res) => {

  db.all(
    `
    SELECT
      id,
      label,
      article_count,
      heat_score
    FROM clusters
    ORDER BY heat_score DESC, article_count DESC
    `,
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json(rows);
    }
  );

});
app.get("/clusters/:id", (req, res) => {

  const clusterId = req.params.id;

  db.all(
    `
    SELECT
  id,
  title,
  summary,
  source,
  published,
  url
FROM articles
    WHERE cluster_id = ?
    `,
    [clusterId],
    (err, rows) => {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json(rows);

    }
  );

});


app.post("/refresh", (req, res) => {

  // Return immediately
  res.json({
    success: true
  });

  // Run scraper in background
  exec(
    `cd "${scraperPath}" && python scraper.py`,
    (error, stdout, stderr) => {

      if (error) {
        console.error(stderr);
        return;
      }

      console.log(stdout);

    }
  );

});
app.get("/stats/sources", (req, res) => {

  db.all(
    `
    SELECT
      source,
      COUNT(*) AS count
    FROM articles
    GROUP BY source
    `,
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json(rows);

    }
  );

});
app.get("/stats/top-clusters", (req, res) => {

  db.all(
    `
    SELECT
      label,
      heat_score
    FROM clusters
    ORDER BY heat_score DESC
    LIMIT 10
    `,
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json(rows);

    }
  );

});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});