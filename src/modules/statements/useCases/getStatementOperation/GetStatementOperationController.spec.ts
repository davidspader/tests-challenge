import request from 'supertest'
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database';
import {v4 as uuidV4} from "uuid";

let connection: Connection;
let token: string;
let statementId: string;

describe('GetStatementOperationController', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

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

    const statementResponse = await request(app)
    .post('/api/v1/statements/deposit')
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      amount: 100,
      description: 'Deposit Description'
    });

    statementId = statementResponse.body.id
  });

  afterAll(async () => {
   await  connection.dropDatabase();
   await connection.close();
  });

  it('should be able to get a statement operation', async () => {
    const response = await request(app)
    .get(`/api/v1/statements/${statementId}`)
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toEqual(statementId);
  });

  it('should not be able to get a statement operation if statement does not exist', async () => {
    const response = await request(app)
    .get(`/api/v1/statements/${uuidV4()}`)
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(404);
  });

  it('should not be able to get a statement operation if user does not exist', async () => {
    await connection.query("DELETE FROM users WHERE email = 'user@example.com'");

    const response = await request(app)
    .get(`/api/v1/statements/${statementId}`)
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(404);
  });
});