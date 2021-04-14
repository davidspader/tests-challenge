import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "./CreateUserUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User', () => {
  beforeEach(()=>{
    inMemoryUsersRepository =  new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it('should be able to create a new user', async ()=>{
    const createdUser = await createUserUseCase.execute({
      name: 'User Example',
      email: 'user@example.com',
      password: '1234'
    });

    expect(createdUser).toHaveProperty('id');
  })

  it('should not be able to create a user if the email is already registered', () => {
    expect(async ()=>{
      await createUserUseCase.execute({
        name: 'User Example',
        email: 'user@example.com',
        password: '1234'
      });

      await createUserUseCase.execute({
        name: 'User Example',
        email: 'user@example.com',
        password: '1234'
      });
    }).rejects.toBeInstanceOf(AppError);
  })
})