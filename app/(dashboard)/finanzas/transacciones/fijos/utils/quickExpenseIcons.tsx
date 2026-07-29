import {
  Book,
  Bus,
  Car,
  Coffee,
  Dumbbell,
  Gamepad2,
  Heart,
  Home,
  LucideIcon,
  Phone,
  Pill,
  ShoppingBag,
  Shirt,
  Utensils,
  Wallet,
  Wifi,
  Zap,
} from "lucide-react";

export const QUICK_EXPENSE_ICON_OPTIONS = [
  { id: "wallet", label: "Billetera" },
  { id: "coffee", label: "Café" },
  { id: "utensils", label: "Comida" },
  { id: "car", label: "Transporte" },
  { id: "bus", label: "Bus" },
  { id: "home", label: "Hogar" },
  { id: "shopping-bag", label: "Compras" },
  { id: "zap", label: "Servicios" },
  { id: "heart", label: "Salud" },
  { id: "pill", label: "Farmacia" },
  { id: "dumbbell", label: "Gym" },
  { id: "gamepad-2", label: "Ocio" },
  { id: "book", label: "Estudio" },
  { id: "phone", label: "Teléfono" },
  { id: "wifi", label: "Internet" },
  { id: "shirt", label: "Ropa" },
] as const;

const ICON_MAP: Record<string, LucideIcon> = {
  wallet: Wallet,
  coffee: Coffee,
  utensils: Utensils,
  car: Car,
  bus: Bus,
  home: Home,
  "shopping-bag": ShoppingBag,
  zap: Zap,
  heart: Heart,
  pill: Pill,
  "gamepad-2": Gamepad2,
  dumbbell: Dumbbell,
  book: Book,
  phone: Phone,
  wifi: Wifi,
  shirt: Shirt,
};

export function QuickExpenseIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = ICON_MAP[icon] ?? Wallet;
  return <Icon className={className} />;
}
