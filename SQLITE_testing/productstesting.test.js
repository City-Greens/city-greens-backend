const request = require('supertest');
const server = require('../server');

describe('Products', () => {
    beforeAll((done) => {
        // Add any setup required before tests run
        done();
    });

    it('should list ALL products on /products GET', async () => {
        const res = await request(server).get('/products');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('products');
        expect(Array.isArray(res.body.products)).toBe(true);
    });

    it('should add a SINGLE product on /products POST', async () => {
        const res = await request(server)
            .post('/products')
            .send({ name: 'Oranges', amount: 50, price: 1.25, venderID: 1 });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id');
    });

    it('should list a SINGLE product on /products/:id GET', async () => {
        const res = await request(server).get('/products/1');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('product');
        expect(res.body.product).toHaveProperty('id');
    });

    it('should update a SINGLE product on /products/:id PUT', async () => {
        const res = await request(server)
            .put('/products/1')
            .send({ name: 'Apples', amount: 60, price: 1.50, venderID: 1 });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('changedRows');
    });

    it('should delete a SINGLE product on /products/:id DELETE', async () => {
        const res = await request(server).delete('/products/1');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('deletedRows');
    });
});
