import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let createStatementUseCase: CreateStatementUseCase

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository =  new InMemoryUsersRepository()
    createStatementUseCase =  new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it('should be able to deposit', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Example',
      email: 'user@example.com',
      password: '1234'
    });

    
    const id = user.id as string;

    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: 'Description Example',
      type: 'deposit' as OperationType,
      user_id: id
    });

    expect(statement).toHaveProperty('id');
  });

  it('should be able to withdraw', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Example',
      email: 'user@example.com',
      password: '1234'
    });

    
    const id = user.id as string;

    await createStatementUseCase.execute({
      amount: 100,
      description: 'Deposit Example',
      type: 'deposit' as OperationType,
      user_id: id
    });
    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: 'Withdraw Example',
      type: 'withdraw' as OperationType,
      user_id: id
    });

    expect(statement).toHaveProperty('id')
  });

  it('should not be able to deposit if user don t exist', () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        description: 'Description Example',
        type: 'deposit' as OperationType,
        user_id: 'fakeId'
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to withdraw if the withdrawal is greater than the credits', () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'User Example',
        email: 'user@example.com',
        password: '1234'
      });
  
      const id = user.id as string;

      await createStatementUseCase.execute({
        amount: 100,
        description: 'Description Example',
        type: 'withdraw' as OperationType,
        user_id: id
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})