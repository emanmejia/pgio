require('dotenv').config();

const multer = require("multer");
const upload = multer();

const express = require("express");
const app = express();

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 2
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded form data

app.listen(process.env.PORT || 5001, () => {
    console.log("Server started (http://localhost:5001/) !");
});

app.get("/", (req, res) => {
    const sql = "SELECT COUNT(*) FROM PRODUCT"; // Assuming your vehicle table is still named 'PRODUCT'
    pool.query(sql, [], (err, result) => {
        let message = "";
        let vehicleCount = 0;
        if (err) {
            message = `Error fetching vehicle count: ${err.message}`;
        } else {
            message = "success";
            vehicleCount = result.rows[0].count;
        }
        res.render("index", {
            message: message,
            vehicleCount: vehicleCount,
            errors: [] // Initialize errors array
        });
    });
});

app.get("/input", (req, res) => {
    res.render("input"); // You might not need this separate input page anymore
});

app.post("/input", upload.single('vehicleFile'), async (req, res) => {
    // ... (rest of your code) ...

    const buffer = req.file.buffer;
    const lines = buffer.toString().split(/\r?\n/);
    const importErrors = [];

    for (const line of lines) {
        const vehicleData = line.split(","); // <--- ADJUST THIS LINE IF YOUR TXT USES A DIFFERENT DELIMITER

        if (vehicleData.length === 4) {
            const [prod_id, prod_name, prod_desc, prod_price] = vehicleData.map(item => item.trim());
            const sqlInsert = "INSERT INTO PRODUCT(prod_id, prod_name, prod_desc, prod_price) VALUES ($1, $2, $3, $4)";
            try {
                await pool.query(sqlInsert, [prod_id, prod_name, prod_desc, prod_price]);
                console.log(`Inserted vehicle with ID: ${prod_id}`);
            } catch (err) {
                importErrors.push({
                    line: line,
                    error: err.message
                });
                console.error(`Error inserting vehicle with ID ${prod_id}: ${err.message}`);
            }
        } else if (line.trim() !== "") {
            importErrors.push({
                line: line,
                error: "Invalid number of attributes in the line."
            });
            console.error(`Invalid data format: ${line}`);
        }
    }

    // ... (rest of your code) ...
});

app.get("/output", (req, res) => {
    let message = "";
    res.render("output", { message: message });
});

app.post("/output", (req, res) => {
    const sql = "SELECT * FROM PRODUCT ORDER BY PROD_ID";
    pool.query(sql, [], (err, result) => {
        let message = "";
        if (err) {
            message = `Error - ${err.message}`;
            res.render("output", { message: message })
        } else {
            let output = "";
            result.rows.forEach(product => {
                output += `${product.prod_id},${product.prod_name},${product.prod_desc},${product.prod_price}\r\n`;
            });
            res.header("Content-Type", "text/csv");
            res.attachment("export.csv");
            return res.send(output);
        };
    });
});