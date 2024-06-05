const request = require('supertest');
const app = require('../server');  // Adjust the path as needed

let server;

beforeAll(done => {
    // Start the server before running the tests
    server = app.listen(4242, () => {
        console.log('Node server listening on port 4242! Visit http://localhost:4242 in your browser.');
        done();
    });
});

afterAll(done => {
    server.close(done);
});

describe('Vendor API', () => {

    it('should create a new vendor', async () => {
        const newVendor = {
            name: "Test Vendor",
            image: "http://example.com/image.jpg",
            address: "123 Test Street, Test City, TC",
            description: "Test description",
            email: "test@example.com",
            phone_number: "123-456-7890"
        };

        const res = await request(app)
            .post('/vender')
            .send(newVendor);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id');
    });

    it('should get all vendors with their products', async () => {
        const res = await request(app)
            .get('/vender')
            .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('vendors');
        expect(Array.isArray(res.body.vendors)).toBeTruthy();
    });

    it('should get a specific vendor by ID', async () => {
        const vendorId = 1;
        const res = await request(app)
            .get(`/vender/${vendorId}`)
            .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('vendor');
        expect(res.body.vendor).toHaveProperty('id', vendorId);
    });

    it('should update a vendor\'s details', async () => {
        const vendorId = 1;
        const updatedVendor = {
            name: "Updated Vendor",
            image: "http://example.com/newimage.jpg",
            address: "456 New Street, New City, NC",
            description: "Updated description",
            email: "new@example.com",
            phone_number: "987-654-3210"
        };

        const res = await request(app)
            .put(`/vender/${vendorId}`)
            .send(updatedVendor);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('changedRows', 1);
    });

    it('should delete a vendor', async () => {
        const vendorId = 1;
        const res = await request(app)
            .delete(`/vender/${vendorId}`)
            .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('deletedRows', 1);
    });

});
