// Add required packages
const express = require("express");
const app = express();

// Add database package and connection string (can remove ssl)
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 2
});


// Set up EJS
app.set("view engine", "ejs");

// Start listener
app.listen(process.env.PORT || 5001, () => {
    console.log("Server started (http://localhost:5001/) !");
});

// Setup routes
app.get("/", (req, res) => {
  //res.send ("Hello world...");
  res.render("index");
});
