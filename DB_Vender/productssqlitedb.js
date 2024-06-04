const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

app.post('/products', (req, res) => {
    const { name, amount, price, venderID } = req.body;
    if (!name || !amount || !price || !venderID) {
        return res.status(400).json({ error: "Please provide name, amount, price, and venderID" });
    }
    db.run('INSERT INTO products (name, amount, price, venderID) VALUES (?, ?, ?, ?)', [name, amount, price, venderID], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

app.get('/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ products: rows });
    });
});

app.get('/products/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ product: row });
    });
});

app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, amount, price, venderID } = req.body;
    db.run('UPDATE products SET name = ?, amount = ?, price = ?, venderID = ? WHERE id = ?', [name, amount, price, venderID, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ changedRows: this.changes });
    });
});

app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ deletedRows: this.changes });
    });
});

module.exports = app;
