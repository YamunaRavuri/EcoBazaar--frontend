import { CartItem } from "./cart-item";

export interface CartSummaryDto {
  cartItems: CartItem[];
  totalPrice: number;
  totalCarbon: number;
  ecoSuggestion: string | null;  // ← Correct spelling
}