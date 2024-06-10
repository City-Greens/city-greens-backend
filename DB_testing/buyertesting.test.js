const request = require("supertest");
const { app, db } = require("../DB_Buyer/buyersqlitedb");

beforeAll(done => {
  // Initialize database before all tests
  db.serialize(() => {
    db.run('DROP TABLE IF EXISTS buyers');
    db.run('CREATE TABLE buyers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, storeID TEXT)', () => {
      db.run('INSERT INTO buyers (name, email, storeID) VALUES (?, ?, ?)', ['John Doe', 'john@example.com', 'accountID']);
    });
  });
  done();
});

describe("Buyer API", () => {
  it("should create a new buyer", async () => {
    const response = await request(app)
      .post("/buyers")
      .send({
        name: "Jane Smith",
        email: "jane@example.com",
        storeID: "store123"
      });
    expect(response.status).toBe(200);
    expect(response.body.id).toBeDefined();
  });

  it("should fetch all buyers", async () => {
    const response = await request(app).get("/buyers");
    expect(response.status).toBe(200);
    expect(response.body.buyers).toBeInstanceOf(Array);
  });

  it("should fetch a specific buyer by ID", async () => {
    const response = await request(app).get("/buyers/1");
    expect(response.status).toBe(200);
    expect(response.body.buyer).toBeDefined();
    expect(response.body.buyer.name).toBe("John Doe");
  });

  it("should return 404 for non-existent buyer", async () => {
    const response = await request(app).get("/buyers/999");
    expect(response.status).toBe(404);
  });

  it("should update a buyer", async () => {
    const response = await request(app)
      .put("/buyers/1")
      .send({
        name: "John Doe Updated",
        email: "johnupdated@example.com",
        storeID: "accountID"
      });
    expect(response.status).toBe(200);
    expect(response.body.changedRows).toBe(1);

    const buyerResponse = await request(app).get("/buyers/1");
    expect(buyerResponse.body.buyer.name).toBe("John Doe Updated");
  });

  it("should delete a buyer", async () => {
    const response = await request(app).delete("/buyers/1");
    expect(response.status).toBe(200);
    expect(response.body.deletedRows).toBe(1);

    const buyerResponse = await request(app).get("/buyers/1");
    expect(buyerResponse.status).toBe(404);
  });

  it("should return 400 for missing fields when creating a buyer", async () => {
    const response = await request(app).post("/buyers").send({
      name: "Incomplete Buyer",
      email: "incomplete@example.com"
    });
    expect(response.status).toBe(400);
  });

  it("should create a new buyer and fetch by ID", async () => {
    const buyerResponse = await request(app).post("/buyers").send({
      name: "Tom Test",
      email: "tom@example.com",
      storeID: "store456"
    });
    const buyerId = buyerResponse.body.id;

    const response = await request(app).get(`/buyers/${buyerId}`);
    expect(response.status).toBe(200);
    expect(response.body.buyer.name).toBe("Tom Test");
  });

  it("should fetch all buyers even if only one exists", async () => {
    const response = await request(app).get("/buyers");
    expect(response.status).toBe(200);
    expect(response.body.buyers).toBeInstanceOf(Array);
  });

  it("should update a buyer's email", async () => {
    const response = await request(app)
      .put("/buyers/2")
      .send({
        name: "Jane Smith",
        email: "janeupdated@example.com",
        storeID: "store123"
      });
    expect(response.status).toBe(200);
    expect(response.body.changedRows).toBe(1);

    const buyerResponse = await request(app).get("/buyers/2");
    expect(buyerResponse.body.buyer.email).toBe("janeupdated@example.com");
  });
});
