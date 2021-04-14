import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;


describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to authenticate a user', async () => {
    const user = {
      name: 'User Example',
      email: 'user@example.com',
      password: '1234'
    };

    const passwordHash = await hash(user.password, 8)
    
    await inMemoryUsersRepository.create({
      name: user.name,
      email: user.email,
      password: passwordHash
    });

    const authResponse = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(authResponse).toHaveProperty('user');
    expect(authResponse.user).toHaveProperty('id');
    expect(authResponse).toHaveProperty('token');
  });

  it('should not be able to authenticate a user with incorrect password', () => {
    expect(async ()=>{
      const user = {
        name: 'User Example',
        email: 'user@example.com',
        password: '1234'
      };

      const passwordHash = await hash(user.password, 8)

      await inMemoryUsersRepository.create({
        name: user.name,
        email: user.email,
        password: passwordHash
      });

      await authenticateUserUseCase.execute({
        email: user.email,
        password: '12345'
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to authenticate a user with incorrect email', () => {
    expect(async ()=>{
      const user = {
        name: 'User Example',
        email: 'user@example.com',
        password: '1234'
      };

      const passwordHash = await hash(user.password, 8)

      await inMemoryUsersRepository.create({
        name: user.name,
        email: user.email,
        password: passwordHash
      });

      await authenticateUserUseCase.execute({
        email: "notemailuser@example.com",
        password: '1234'
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})