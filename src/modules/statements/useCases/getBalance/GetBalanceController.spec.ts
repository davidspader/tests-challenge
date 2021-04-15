import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let connection: Connection;
let token: string;

describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  it('should be able to get the balance', async () => {
    await request(app)
    .post('/api/v1/users')
    .send({
      name: 'User Example',
      email: 'user@example.com',
      password: '1234'
    });
    const authResponse = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: 'user@example.com',
      password: '1234'
    });

    token = authResponse.body.token;

    const response = await request(app)
    .get(`/api/v1/statements/balance`)
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance')
    expect(response.body).toHaveProperty('statement')
  });

  it('should not be able to get the balance when token is invalid', async () => {
    const response = await request(app)
    .get(`/api/v1/statements/balance`)
    .set({
      Authorization: "Bearer InvalidBearer"
    });

    expect(response.status).toBe(401);
  });

  it('should not be able to get balance of user not registered', async () => {
    await connection.query("DELETE FROM users WHERE email = 'user@example.com'");

    const response = await request(app)
    .get(`/api/v1/statements/balance`)
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(404);
  });
});