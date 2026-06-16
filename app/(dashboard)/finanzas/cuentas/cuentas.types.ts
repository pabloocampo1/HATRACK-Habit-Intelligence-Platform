export type CuentasFilterKey = "all" | "active" | "inactive" | "savings";

export type CuentasModal =
  | null
  | "create"
  | "edit"
  | "transfer"
  | "deactivate";
