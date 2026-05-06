const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

/* ================= EEG ANALYSIS LOGIC ================= */

function analyzeEEG(values) {
  const avg =
    values.reduce((sum, v) => sum + v, 0) / values.length;

  const max = Math.max(...values);
  const min = Math.min(...values);

  // Signal variability (important for EEG)
  const variability = max - min;

  let state = "Relaxed";
  let confidence = 70;

  // 🧠 Logic for 4 cognitive states
  if (avg > 70 && variability > 40) {
    state = "Stressed";
    confidence = 85;
  } else if (avg > 50 && variability < 30) {
    state = "Focused";
    confidence = 80;
  } else if (avg < 30 && variability < 20) {
    state = "Fatigue";
    confidence = 75;
  } else {
    state = "Relaxed";
    confidence = 78;
  }

  return { state, confidence };
}

/* ================= ROUTE ================= */

app.post("/analyze", upload.single("file"), (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => {
      // 👉 Automatically pick numeric value from any column
      const value = parseFloat(Object.values(data)[0]);

      if (!isNaN(value)) {
        results.push(value);
      }
    })
    .on("end", () => {
      if (results.length === 0) {
        return res.status(400).json({
          error: "No valid EEG data found in file",
        });
      }

      const { state, confidence } = analyzeEEG(results);

      // 🎤 Neural Nurse message
      let message = "";
      switch (state) {
        case "Stressed":
          message = "Patient is under high stress. Immediate relaxation advised.";
          break;
        case "Focused":
          message = "Patient is highly focused and cognitively engaged.";
          break;
        case "Fatigue":
          message = "Patient shows signs of fatigue. Rest is recommended.";
          break;
        default:
          message = "Patient is calm and stable.";
      }

      res.json({
        state,
        confidence,
        message,
        values: results.slice(0, 100), // limit for graph
      });

      // cleanup file
      fs.unlinkSync(req.file.path);
    });
});

/* ================= SERVER ================= */

app.listen(5000, () =>
  console.log("🚀 Server running on port 5000")
);