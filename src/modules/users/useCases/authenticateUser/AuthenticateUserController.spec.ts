import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';

import createConnection from '../../../../database'

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate an user', async () => {
    await request(app)
    .post('/api/v1/users')
    .send({
      name: 'User Example',
      email: "user@example.com",
    	password: "1234"
    });

    const response = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: "user@example.com",
    	password: "1234"
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
  });

  it('should not be able to authenticate a user with incorrect password', async () => {
    const response = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: 'user@example.com',
    	password: '12345'
    });

    expect(response.status).toBe(401);
    expect(response.body).not.toHaveProperty('user');
    expect(response.body).not.toHaveProperty('token');
  });

  it('should not be able to authenticate a user with incorrect email', async () => {
    const response = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: 'emailTest@example.com',
    	password: '1234'
    });

    expect(response.status).toBe(401);
    expect(response.body).not.toHaveProperty('user');
    expect(response.body).not.toHaveProperty('token');
  });
});