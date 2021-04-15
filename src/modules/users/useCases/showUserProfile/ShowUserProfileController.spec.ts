
import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let connection:Connection;
let token: string;

describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show a user profile', async () => {
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
    })

    token = authResponse.body.token
    
    const response = await request(app)
    .get('/api/v1/profile')
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('name');
  });

  it('should not be able to show an user profile when the token is incorrect', async () => {
    const response = await request(app)
    .get('/api/v1/profile')
    .set({
      Authorization: "Bearer invalidBearer"
    });

    expect(response.status).toBe(401);
  });

  it('should not be able to show a user profile when is missing token', async () => {
    const response = await request(app)
    .get('/api/v1/profile')
    expect(response.status).toBe(401);
  });

  it('should not be able to show a user profile when user don t exists', async () => {
    await connection.query("DELETE FROM users WHERE email = 'user@example.com'")

    const response = await request(app)
    .get('/api/v1/profile')
    .set({
      Authorization: `Bearer ${token}`
    });
    expect(response.status).toBe(404);
  });
});