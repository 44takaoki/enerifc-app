/** 所有者の案件が見つからない、または論理削除済み。 */
export class ProjectNotFoundError extends Error {
  readonly name = "ProjectNotFoundError";

  constructor(message = "Project not found") {
    super(message);
  }
}
