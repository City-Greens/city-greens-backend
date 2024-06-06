const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database(":memory:");

app.post("/add-product", (req, res) => {
  //NOTE: grab from front end
  const { name, quantity, price, vendor_id } = req.body;
  console.log("You are here!", req.body);
  // SEND TO STRIPE
  // GET BACK FROM STRIPE
  // ADD THAT OBJECT TO DB WITH ADDITION default_price
  // if (!name || !quantity || !price || !vendor_id) {
  //   return res
  //     .status(400)
  //     .json({ error: "Please provide name, quantity, price, and vendor_id" });
  // }
  // db.run(
  //   "INSERT INTO products (name, quantity, price, vendor_id) VALUES (?, ?, ?, ?)",
  //   [name, quantity, price, vendor_id],
  //   function (err) {
  //     if (err) {
  //       return res.status(500).json({ error: err.message });
  //     }
  //     res.json({ id: this.lastID });
  //   },
  // );
});

app.get("/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ products: rows });
  });
});

app.get("/products/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ product: row });
  });
});

app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, quantity, price, vendor_id } = req.body;
  db.run(
    "UPDATE products SET name = ?, quantity = ?, price = ?, vendor_id = ? WHERE id = ?",
    [name, quantity, price, vendor_id, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ changedRows: this.changes });
    },
  );
});

app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ deletedRows: this.changes });
  });
});

module.exports = { app, db };
