const request = require('supertest');
const app = require('../src/app');

describe('Auth API', () => {
  test('POST /api/v1/auth/register - registers a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test Admin',
      email: `admin_${Date.now()}@test.com`,
      password: 'Test@1234',
      role: 'admin',
    });
    expect([201, 409]).toContain(res.statusCode);
  });

  test('POST /api/v1/auth/login - fails with wrong credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'wrong@test.com',
      password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/v1/health - health check', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});