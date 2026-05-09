import {
  Banknote,
  Building2,
  PiggyBank,
  Smartphone,
  Wallet,
} from "lucide-react";
import type { AccountType } from "../accounts.constants";

export function AccountTypeIcon({ type }: { type: AccountType }) {
  const cls = "size-5 stroke-[1.55]";
  switch (type) {
    case "BANK":
      return <Building2 className={cls} />;
    case "CASH":
      return <Banknote className={cls} />;
    case "DIGITAL_WALLET":
      return <Smartphone className={cls} />;
    case "SAVINGS":
      return <PiggyBank className={cls} />;
    default:
      return <Wallet className={cls} />;
  }
}
