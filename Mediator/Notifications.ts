// deno-lint-ignore-file no-explicit-any
import { Notification } from "../deps.ts";

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
  constructor(public userId: string) {
    super();
  }
}
export class LobbyCreatedNotification extends Notification {
  constructor(public userId: string, public lobbyKey: string) {
    super();
  }
}

export class JoinLobbyNotification extends Notification {
  constructor(public userId: string, public lobbyKey: string) {
    super();
  }
}
export class LobbyJoinedNotification extends Notification {
  constructor(public userId: string, public lobbyKey: string) {
    super();
  }
}

export class LeaveLobbyNotification extends Notification {
  constructor(public userId: string) {
    super();
  }
}

export class LobbyLeftNotification extends Notification {
  constructor(
    public userId: string,
    public lobbyKey: string,
  ) {
    super();
  }
}

export class NewAdminNotification extends Notification {
  constructor(public adminId: string, public lobbyKey: string) {
    super();
  }
}
