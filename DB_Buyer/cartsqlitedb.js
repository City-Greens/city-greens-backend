const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run('DROP TABLE IF EXISTS carts');
    db.run('CREATE TABLE carts (id INTEGER PRIMARY KEY AUTOINCREMENT, buyer_id INTEGER, item TEXT, quantity INTEGER, FOREIGN KEY(buyer_id) REFERENCES buyers(id))', () => {
        db.run('INSERT INTO carts (buyer_id, item, quantity) VALUES (?, ?, ?)', [1, 'Apple', 3]);
    });
});
// Cart routes
app.post('/carts', (req, res) => {
    const { buyer_id, item, quantity } = req.body;
    if (!buyer_id || !item || !quantity) {
        return res.status(400).json({ error: "Please provide buyer_id, item, and quantity" });
    }
    db.run('INSERT INTO carts (buyer_id, item, quantity) VALUES (?, ?, ?)', [buyer_id, item, quantity], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

app.get('/carts', (req, res) => {
    db.all('SELECT * FROM carts', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ carts: rows });
    });
});

app.get('/carts/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM carts WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ cart: row });
    });
});

app.put('/carts/:id', (req, res) => {
    const { id } = req.params;
    const { buyer_id, item, quantity } = req.body;
    db.run('UPDATE carts SET buyer_id = ?, item = ?, quantity = ? WHERE id = ?', [buyer_id, item, quantity, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ changedRows: this.changes });
    });
});

app.delete('/carts/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM carts WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ deletedRows: this.changes });
    });
});

module.exports = {app,db};