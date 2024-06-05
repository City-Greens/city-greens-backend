const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run('DROP TABLE IF EXISTS vender');
    db.run('DROP TABLE IF EXISTS products');
    db.run('CREATE TABLE vender (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, image TEXT, address TEXT, description TEXT, email TEXT, phone_number TEXT)', () => {
        db.run('INSERT INTO vender (name, image, address, description, email, phone_number) VALUES (?, ?, ?, ?, ?, ?)', ['Brocks Bananas', 'image_url', '123 Banana Street, Seattle, WA', 'Best bananas in town', 'contact@brocksbananas.com', '123-456-7890']);
    });

    db.run('CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, amount INTEGER, price REAL, venderID INTEGER, FOREIGN KEY(venderID) REFERENCES vender(id))', () => {
        db.run('INSERT INTO products (name, amount, price, venderID) VALUES (?, ?, ?, ?)', ['Bananas', 12, 2.99, 1]);
    });
});

app.post('/vender', (req, res) => {
    const { name, image, address, description, email, phone_number } = req.body;
    if (!name || !address || !email || !phone_number) {
        return res.status(400).json({ error: "Please provide name, image, address, description, email, and phone_number" });
    }
    db.run('INSERT INTO vender (name, image, address, description, email, phone_number) VALUES (?, ?, ?, ?, ?, ?)', [name, image, address, description, email, phone_number], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

app.get('/vender', (req, res) => {
    db.all('SELECT * FROM vender', [], (err, vendors) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const vendorIds = vendors.map(v => v.id);
        db.all('SELECT * FROM products WHERE venderID IN (' + vendorIds.join(',') + ')', [], (err, products) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const vendorsWithProducts = vendors.map(vendor => {
                return {
                    ...vendor,
                    products: products.filter(product => product.venderID === vendor.id)
                };
            });

            res.json({ vendors: vendorsWithProducts });
        });
    });
});

app.get('/vender/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM vender WHERE id = ?', [id], (err, vendor) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!vendor) {
            return res.status(404).json({ error: "Vendor not found" });
        }

        db.all('SELECT * FROM products WHERE venderID = ?', [id], (err, products) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            vendor.products = products;
            res.json({ vendor });
        });
    });
});

app.put('/vender/:id', (req, res) => {
    const { id } = req.params;
    const { name, image, address, description, email, phone_number } = req.body;
    db.run('UPDATE vender SET name = ?, image = ?, address = ?, description = ?, email = ?, phone_number = ? WHERE id = ?', [name, image, address, description, email, phone_number, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ changedRows: this.changes });
    });
});

app.delete('/vender/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM vender WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ deletedRows: this.changes });
    });
});

module.exports = app;

