// deno-lint-ignore-file no-explicit-any
import { Notification } from "../deps.ts";
import { Lobby } from "../Domain/Lobby.ts";
import { Player } from "../Domain/Player.ts";
import User from "../Domain/User.ts";

export class Send extends Notification {
  constructor(public recipientId: string, public message: any) {
    super();
  }
}

export class Notify extends Notification {
  constructor(public lobbyKey: string, public message: any) {
    super();
  }
}

export class Broadcast extends Notification {
  constructor(
    public broadcasterId: string,
    public lobbyKey: string,
    public message: any,
  ) {
    super();
  }
}

export class CreateLobbyNotification extends Notification {
  constructor(public user: User) {
    super();
  }
}
export class LobbyCreatedNotification extends Notification {
  constructor(public user: User, public lobby: Lobby) {
    super();
  }
}
export class LobbyCreatedErrorNotification extends Notification {
  constructor(
    public user: User,
    public err: string,
  ) {
    super();
  }
}

export class JoinLobbyNotification extends Notification {
  constructor(public user: User, public lobbyKey: string) {
    super();
  }
}
export class LobbyJoinedNotification extends Notification {
  constructor(public user: User, public lobby: Lobby) {
    super();
  }
}
export class LobbyJoinedErrorNotification extends Notification {
  constructor(public user: User, public err: string) {
    super();
  }
}

export class LeaveLobbyNotification extends Notification {
  constructor(public user: User) {
    super();
  }
}

export class LobbyLeftNotification extends Notification {
  constructor(
    public user: User,
    public lobby: Lobby,
  ) {
    super();
  }
}

export class NewAdminNotification extends Notification {
  constructor(public admin: Player, public lobby: Lobby) {
    super();
  }
}
