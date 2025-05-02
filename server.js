const express = require("express");
const path = require("path");
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from specific directories with correct MIME types
app.use(
  "/css",
  express.static(path.join(__dirname, "css"), {
    setHeaders: (res, path) => {
      res.setHeader("Content-Type", "text/css");
    },
  })
);

app.use(
  "/js",
  express.static(path.join(__dirname, "js"), {
    setHeaders: (res, path) => {
      res.setHeader("Content-Type", "application/javascript");
    },
  })
);

app.use("/images", express.static(path.join(__dirname, "images")));

// Handle the old CSS file path
app.get("/pages/styles01.css", (req, res) => {
  res.setHeader("Content-Type", "text/css");
  res.sendFile(path.join(__dirname, "css", "admin-styles.css"));
});

// Import and use routes
const attractionsRouter = require("./routes/attractions");
app.use("/", attractionsRouter);

// Serve other static files
app.use(express.static(__dirname));

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "things-to-do.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the admin panel at http://localhost:${PORT}`);
});
