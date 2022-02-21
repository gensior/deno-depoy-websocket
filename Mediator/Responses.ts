// deno-lint-ignore-file no-explicit-any
type ResponseType = "lobbycreated";

export class BaseResponse {
  public readonly time: number;

  constructor(
    public readonly type: ResponseType,
    public readonly success: boolean,
  ) {
    this.time = new Date().getTime();
  }
}

export class BaseSuccessResponse extends BaseResponse {
  constructor(public readonly type: ResponseType, public readonly data: any) {
    super(type, true);
  }
}

export class BaseErrorResponse extends BaseResponse {
  constructor(
    public readonly type: ResponseType,
    public readonly reason: string,
  ) {
    super(type, false);
  }
}

export const lobbyCreatedSuccess = (lobbyKey: string) =>
  new BaseSuccessResponse("lobbycreated", { lobbyKey });
export const lobbyCreatedError = (reason: string) =>
  new BaseErrorResponse("lobbycreated", reason);
