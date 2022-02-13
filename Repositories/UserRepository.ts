import User from "../Domain/User.ts";
import { BaseRepo } from "./BaseRepo.ts";

export class UserRepository extends BaseRepo<User> {}

export const UserRepositorySingleton = new UserRepository();
