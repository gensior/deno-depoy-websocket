// deno-lint-ignore-file no-explicit-any
import { LobbyWTO } from "../WTOs/LobbyWTO.ts";
import { PlayerWTO } from "../WTOs/PlayerWTO.ts";

type ResponseType =
  | "createdlobby"
  | "joinedlobby"
  | "leftlobby"
  | "playerjoined"
  | "playerleft";

export class BaseResponse {
  public readonly time: number;

  constructor(
    public readonly action: ResponseType,
    public readonly success: boolean,
  ) {
    this.time = new Date().getTime();
  }
}

export class BaseSuccessResponse extends BaseResponse {
  constructor(public readonly action: ResponseType, public readonly data: any) {
    super(action, true);
  }
}

export class BaseErrorResponse extends BaseResponse {
  constructor(
    public readonly action: ResponseType,
    public readonly reason: string,
  ) {
    super(action, false);
  }
}

export const lobbyCreatedSuccess = (lobby: LobbyWTO) =>
  new BaseSuccessResponse("createdlobby", { lobby });
export const lobbyCreatedError = (reason: string) =>
  new BaseErrorResponse("createdlobby", reason);

export const lobbyJoinedSuccess = (lobby: LobbyWTO) =>
  new BaseSuccessResponse("joinedlobby", { lobby });
export const lobbyJoinedError = (reason: string) =>
  new BaseErrorResponse("joinedlobby", reason);

export const leaveLobbySuccess = (lobbyKey: string) =>
  new BaseSuccessResponse("leftlobby", { lobbyKey });
export const leaveLobbyError = (reason: string) =>
  new BaseErrorResponse("leftlobby", reason);

export const playerLeftLobby = (playerId: string) =>
  new BaseSuccessResponse("playerleft", { playerId });

export const playerJoinedLobby = (player: PlayerWTO) =>
  new BaseSuccessResponse("playerjoined", { player });
