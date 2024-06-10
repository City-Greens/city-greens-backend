const request = require("supertest");
const { app, db } = require("../DB_Vender/vendersqlitedb");

beforeAll(done => {
  // Initialize database before all tests
  db.serialize(() => {
    db.run("DROP TABLE IF EXISTS vender");
    db.run("DROP TABLE IF EXISTS products");
    db.run(
      "CREATE TABLE vender (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, image TEXT, address TEXT, description TEXT, email TEXT, phone_number TEXT)",
      () => {
        db.run(
          "INSERT INTO vender (name, image, address, description, email, phone_number) VALUES (?, ?, ?, ?, ?, ?)",
          [
            "Brocks Bananas",
            "image_url",
            "123 Banana Street, Seattle, WA",
            "Best bananas in town",
            "contact@brocksbananas.com",
            "123-456-7890",
          ],
        );
      },
    );

    db.run(
      "CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, amount INTEGER, price REAL, venderID INTEGER, FOREIGN KEY(venderID) REFERENCES vender(id))",
      () => {
        db.run(
          "INSERT INTO products (name, amount, price, venderID) VALUES (?, ?, ?, ?)",
          ["Bananas", 12, 2.99, 1],
        );
      },
    );
  });
  done();
});

describe("Vendor API", () => {
  it("should create a new vendor", async () => {
    const response = await request(app)
      .post("/vender")
      .send({
        name: "Fruit Emporium",
        image: "image_url",
        address: "456 Fruit Ave, San Francisco, CA",
        description: "Fresh fruits daily",
        email: "contact@fruitemporium.com",
        phone_number: "987-654-3210",
      });
    expect(response.status).toBe(200);
    expect(response.body.id).toBeDefined();
  });

  it("should fetch all vendors with their products", async () => {
    const response = await request(app).get("/vender");
    expect(response.status).toBe(200);
    expect(response.body.vendors).toBeInstanceOf(Array);
    expect(response.body.vendors[0].products).toBeInstanceOf(Array);
  });

  it("should fetch a specific vendor by ID", async () => {
    const response = await request(app).get("/vender/1");
    expect(response.status).toBe(200);
    expect(response.body.vendor).toBeDefined();
    expect(response.body.vendor.name).toBe("Brocks Bananas");
  });

  it("should return 404 for non-existent vendor", async () => {
    const response = await request(app).get("/vender/999");
    expect(response.status).toBe(404);
  });

  it("should update a vendor", async () => {
    const response = await request(app)
      .put("/vender/1")
      .send({
        name: "Brocks Bananas Updated",
        image: "new_image_url",
        address: "123 Banana Street, Seattle, WA",
        description: "Best bananas in town",
        email: "contact@brocksbananas.com",
        phone_number: "123-456-7890",
      });
    expect(response.status).toBe(200);
    expect(response.body.changedRows).toBe(1);

    const vendorResponse = await request(app).get("/vender/1");
    expect(vendorResponse.body.vendor.name).toBe("Brocks Bananas Updated");
  });

  it("should delete a vendor", async () => {
    const response = await request(app).delete("/vender/1");
    expect(response.status).toBe(200);
    expect(response.body.deletedRows).toBe(1);

    const vendorResponse = await request(app).get("/vender/1");
    expect(vendorResponse.status).toBe(404);
  });

  it("should return 400 for missing fields when creating a vendor", async () => {
    const response = await request(app).post("/vender").send({
      name: "Incomplete Vendor",
      address: "789 Incomplete St, Test City, TC",
      email: "incomplete@vendor.com",
    });
    expect(response.status).toBe(400);
  });

  it("should create a new vendor and associate products", async () => {
    const vendorResponse = await request(app).post("/vender").send({
      name: "Apple Orchard",
      image: "apple_image_url",
      address: "123 Apple St, Cupertino, CA",
      description: "Fresh apples",
      email: "contact@appleorchard.com",
      phone_number: "123-123-1234",
    });
    const vendorId = vendorResponse.body.id;

    const productResponse = await request(app).post("/vender").send({
      name: "Apple",
      amount: 50,
      price: 1.5,
      venderID: vendorId,
    });
    expect(productResponse.status).toBe(200);

    const response = await request(app).get(`/vender/${vendorId}`);
    expect(response.body.vendor.products).toHaveLength(1);
    expect(response.body.vendor.products[0].name).toBe("Apple");
  });

  it("should fetch all vendors even if no products exist", async () => {
    const response = await request(app).get("/vender");
    expect(response.status).toBe(200);
    expect(response.body.vendors).toBeInstanceOf(Array);
  });

  it("should update a vendor's product details", async () => {
    const productResponse = await request(app).put("/vender/1").send({
      name: "Bananas Updated",
      amount: 10,
      price: 3.5,
      venderID: 1,
    });
    expect(productResponse.status).toBe(200);
    expect(productResponse.body.changedRows).toBe(1);

    const response = await request(app).get("/vender/1");
    expect(response.body.vendor.products[0].name).toBe("Bananas Updated");
  });
});
