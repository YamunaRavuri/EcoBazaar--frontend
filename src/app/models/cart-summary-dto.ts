
import { CartItem } from "./cart-item";

export interface CartSummaryDto {
  items: CartItem[];
  totalPrice: number;
  totalCarbonUsed: number;
  totalCarbonSaved: number;
  ecoSuggestion: string | null;

  swapSuggestion: {
    cartItemIdToReplace: number;
    suggestedProductId: number;
    suggestedProductName: string;
    carbonSavingsPerUnit: number;
    quantity: number;
    totalSavings?: number; 
  } | null;
}