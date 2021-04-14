import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"


let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('GetStatement Operation', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository =  new InMemoryStatementsRepository();
    getStatementOperationUseCase =  new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it('should be able to get statement operation', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Name Example',
      email: 'email@example.com',
      password: 'password'
    });

    const userId = user.id as string;

    const statement = await inMemoryStatementsRepository.create({
      user_id: userId,
      amount: 100,
      description: 'Deposit Example',
      type: "deposit" as OperationType
    });

    const statementId = statement.id as string;

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: userId,
      statement_id: statementId
    });

    expect(statementOperation).toEqual(statement);

  });
})