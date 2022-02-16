import { Err, Ok, Result } from "../deps.ts";
import User from "../Domain/User.ts";
import {
  UserRepository,
  UserRepositorySingleton,
} from "../Repositories/UserRepository.ts";

export class UserController {
  constructor(private repository: UserRepository = UserRepositorySingleton) {}

  public create(id: string, name: string): Result<User, string> {
    const user = User.Hydrate(id, name);
    return this.repository.save(user);
  }

  public saveOrUpdate(id: string, name: string): Result<User, string> {
    const providedUser = User.Hydrate(id, name);
    const savedUser = this.repository.get(id);

    return savedUser.match({
      some: (user) => {
        if (user.name != providedUser.name) {
          return this.update(providedUser);
        } else {
          return Ok(user);
        }
      },
      none: () => this.repository.save(providedUser),
    });
  }

  public update(user: User): Result<User, string> {
    return this.repository.update(user.id, user);
  }

  public get(id: string): Result<User, string> {
    return this.repository.get(id).match({
      some: (val): Result<User, string> => Ok(val),
      none: (): Result<User, string> => Err("Could not find user."),
    });
  }
}

export const UserControllerSingleton = new UserController();
