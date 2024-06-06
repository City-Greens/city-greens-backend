require("dotenv").config();
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database(":memory:");

app.post("/add-product", async (req, res) => {
  const { name, default_price_data, price, description, vendor_id } = req.body;
  let finalProduct = {};
  try {
    let product = await stripe.products.create(
      {
        name: name,
        default_price_data: default_price_data,
        description: description,
      },
      {
        stripeAccount: vendor_id,
      },
    );

    product = {
      ...product,
      price: price,
      vendor_id: vendor_id,
    };
    finalProduct = product;
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create a product",
      error,
    );
    res.status(500);
    res.send({ error: error.message });
  }

  db.run(
    `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    default_price_data TEXT,
    description TEXT,
    price REAL,
    vendor_id INTEGER
  )`,
    (err) => {
      if (err) {
        console.error(err.message);
      } else {
        db.run(
          "INSERT INTO products (name, default_price_data, description, price, vendor_id) VALUES (?, ?, ?, ?, ?)",
          [name, default_price_data, description, price, vendor_id],
          function (err) {
            if (err) {
              console.log("Error", err);
              return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID });
          },
        );
      }
    },
  );
});

app.get("/all-products", async (req, res) => {
  //TODO: Make persistent
  // db.all("SELECT * FROM products", [], (err, rows) => {
  //   if (err) {
  //     return res.status(500).json({ error: err.message });
  //   }
  //   res.json({ products: rows });
  // });
  try {
    const accountsResponse = await stripe.accounts.list({ limit: 100 });
    const accounts = accountsResponse.data;

    const allProducts = await Promise.all(
      accounts.map(async (account) => {
        const productsResponse = await stripe.products.list(
          { limit: 100 },
          { stripeAccount: account.id },
        );

        const productsWithPrices = await Promise.all(
          productsResponse.data.map(async (product) => {
            let formattedPrice = "N/A";
            if (product.default_price) {
              try {
                const priceDetails = await stripe.prices.retrieve(
                  product.default_price,
                  { stripeAccount: account.id },
                );
                if (priceDetails) {
                  formattedPrice = `${(priceDetails.unit_amount / 100).toFixed(2)} ${priceDetails.currency.toUpperCase()}`;
                }
              } catch (error) {
                console.error(
                  `Error fetching price for product ${product.id}:`,
                  error,
                );
              }
            }
            return {
              ...product,
              price: formattedPrice,
              stripeAccount: account.id,
              business_name: account.business_profile.name,
            };
          }),
        );

        return productsWithPrices;
      }),
    );

    const flattenedProducts = allProducts.flat();
    const finalProducts = flattenedProducts.filter(
      (product) => product.active || product.default_price !== null,
    );
    res.json(finalProducts);
  } catch (error) {
    console.error("Error fetching products or prices:", error);
    res.status(500).json({ error: "Failed to fetch products or prices" });
  }
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
