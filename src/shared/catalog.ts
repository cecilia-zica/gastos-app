import {
  ShoppingCart,
  UtensilsCrossed,
  CookingPot,
  Coffee,
  CarTaxiFront,
  PartyPopper,
  Sparkles,
  Gift,
  MonitorPlay,
  Pill,
  Shirt,
  BookOpen,
  Dumbbell,
  ShoppingBag,
  Circle,
  Banknote,
  Landmark,
  CreditCard,
  Zap,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Payment } from "../model/types";

export interface CategoryDef {
  id: string;
  icon: LucideIcon;
}

/** Categorias reais da planilha da usuaria. Icones Lucide (nunca emoji). */
export const CATEGORIES: CategoryDef[] = [
  { id: "Mercado", icon: ShoppingCart },
  { id: "Alimentação", icon: UtensilsCrossed },
  { id: "Restaurante", icon: CookingPot },
  { id: "Lanches/cafés", icon: Coffee },
  { id: "Transporte", icon: CarTaxiFront },
  { id: "Lazer", icon: PartyPopper },
  { id: "Mimos", icon: Sparkles },
  { id: "Presentes", icon: Gift },
  { id: "Assinaturas", icon: MonitorPlay },
  { id: "Saúde", icon: Pill },
  { id: "Roupas", icon: Shirt },
  { id: "Educação", icon: BookOpen },
  { id: "Esporte", icon: Dumbbell },
  { id: "Compras", icon: ShoppingBag },
  { id: "Outros", icon: Circle },
];

export const CATEGORY_ICON: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.icon]),
);

export interface PaymentDef {
  id: Payment;
  icon: LucideIcon;
}

/** Pix incluido: essencial no Brasil e ausente na planilha antiga. */
export const PAYMENTS: PaymentDef[] = [
  { id: "Dinheiro", icon: Banknote },
  { id: "Pix", icon: Zap },
  { id: "Débito", icon: Landmark },
  { id: "Crédito", icon: CreditCard },
  { id: "Caju", icon: Wallet },
];

/** Padroes ao abrir o app. */
export const DEFAULT_CATEGORY = "Mercado";
export const DEFAULT_PAYMENT: Payment = "Débito";
