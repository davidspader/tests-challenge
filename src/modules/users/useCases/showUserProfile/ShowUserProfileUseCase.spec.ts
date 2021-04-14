import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it('should be able to show a user profile', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Example',
      email: 'user@example.com',
      password: '1234'
    });

    const id = user.id as string;

    const profile = await showUserProfileUseCase.execute(id);
    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('name');
    expect(profile).toHaveProperty('email');
  })

  it('should not be able to search with an unregistered id', () => {
    expect(async () => {
      await showUserProfileUseCase.execute('fakeId');
    }).rejects.toBeInstanceOf(AppError);
  })
})