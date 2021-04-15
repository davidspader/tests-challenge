import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let token: string;
let connection: Connection;

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  it('should be able to deposit', async () => {
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
    .post('/api/v1/statements/deposit')
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      amount: 100,
      description: 'Deposit Description'
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.type).toBe('deposit');
  });

  it('should be able to withdraw', async () => {
    const response = await request(app)
    .post('/api/v1/statements/withdraw')
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      amount: 100,
      description: 'Withdraw Description'
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.type).toBe('withdraw');
  });

  it('should not be able to withdraw if the withdrawal is greater than the credits', async () => {
    const response = await request(app)
    .post('/api/v1/statements/withdraw')
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      amount: 100,
      description: 'Withdraw Description'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Insufficient funds' });
  });

  it('should not be able to create a statement when user does not exist', async () => {
    await connection.query("DELETE FROM users WHERE email = 'user@example.com'");

    const depositResponse = await request(app)
    .post('/api/v1/statements/withdraw')
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      amount: 100,
      description: 'Withdraw Description'
    });

    expect(depositResponse.status).toBe(404);
    expect(depositResponse.body).toEqual({ message: 'User not found' });
  });

  it('should not be able to create a statement when token is invalid', async () => {
    const depositResponse = await request(app)
    .post('/api/v1/statements/withdraw')
    .set({
      Authorization: "Bearer invalidBearer"
    })
    .send({
      amount: 100,
      description: 'Withdraw Description'
    });

    expect(depositResponse.status).toBe(401);
    expect(depositResponse.body).toEqual({ message: 'JWT invalid token!' });
  });
});