/** Umbral mínimo de cumplimiento para considerar un reto como logrado. */
export const CHALLENGE_SUCCESS_THRESHOLD = 70;

export function isChallengeSuccessful(completionRate: number): boolean {
  return completionRate >= CHALLENGE_SUCCESS_THRESHOLD;
}

export function challengeOutcomeStatus(
  completionRate: number,
): "completed" | "failed" {
  return isChallengeSuccessful(completionRate) ? "completed" : "failed";
}

export function challengeStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Activo";
    case "completed":
      return "Completado";
    case "failed":
      return "No logrado";
    case "abandoned":
      return "Abandonado";
    default:
      return status;
  }
}
