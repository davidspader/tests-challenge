import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let getBalanceUseCase: GetBalanceUseCase

describe('Get Balance', () => {
  beforeEach(() => {
    inMemoryStatementsRepository =  new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
  });

  it('should be able to get balance', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Example',
      email: 'user@example.com',
      password: '1234'
    });

    const id = user.id as string;

    await inMemoryStatementsRepository.create({
      amount: 100,
      description: 'Deposit Example',
      type: 'deposit' as OperationType,
      user_id: id
    });
    await inMemoryStatementsRepository.create({
      amount: 20,
      description: 'Withdraw Example',
      type: 'withdraw' as OperationType,
      user_id: id
    });

    const balance = await getBalanceUseCase.execute({user_id: id});
    expect(balance).toHaveProperty('statement');
    expect(balance.statement.length).toBe(2);

    expect(balance).toHaveProperty('balance');
    expect(balance.balance).toBe(80);
  });

  it('should not be able to get balance of user not registered', () => {
    expect(async ()=>{
      await getBalanceUseCase.execute({user_id: 'fakeId'})
    }).rejects.toBeInstanceOf(AppError);
  });
});