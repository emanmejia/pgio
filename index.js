require('dotenv').config();

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
  const sql = "SELECT * FROM PRODUCT ORDER BY PROD_ID";
  pool.query(sql, [], (err, result) => {
      let message = "";
      let model = {};
      if(err) {
          message = `Error - ${err.message}`;
      } else {
          message = "success";
          model = result.rows;
      };
      res.render("index", {
          message: message,
          model : model
      });
  });
});
