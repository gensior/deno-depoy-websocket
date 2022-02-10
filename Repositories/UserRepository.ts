import { Option,Some,None } from "../deps.ts";
import User from "../Domain/User.ts";

class UserRepository {
    private users : Map<string, User>;

    constructor() {
        this.users = new Map<string, User>();
    }

    save(user: User) : void {
        this.users.set(user.id, user);
    }

    delete(id: string) : boolean {
        return this.users.delete(id);
    }

    get(id: string) : Option<User> {
        const user = this.users.get(id);

        if (user) {
            return Some(user);
        } else {
            return None;
        }
    }
}

export const UserRepositorySingleton = new UserRepository();