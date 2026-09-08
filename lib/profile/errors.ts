/** ログイン済みだが profiles 行が無い（トリガー未適用など）。 */
export class ProfileNotFoundError extends Error {
  readonly name = "ProfileNotFoundError";

  constructor(message = "Profile not found") {
    super(message);
  }
}
