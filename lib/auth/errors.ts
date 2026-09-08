/** ログイン必須の API / Server Action で、セッションが無いときに投げる。 */
export class UnauthorizedError extends Error {
  readonly name = "UnauthorizedError";

  constructor(message = "Unauthorized") {
    super(message);
  }
}
