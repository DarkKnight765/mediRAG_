const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const env = require("./config/env");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/api", routes);

module.exports = app;
