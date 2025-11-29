import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CartSummaryResponse {
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
  }>;
  totalPrice: number;
  totalCarbonUsed: number;
  totalCarbonSaved: number;
  ecoSuggestion?: string | null;
  swapSuggestion?: {
    cartItemIdToReplace: number;
    suggestedProductId: number;
    suggestedProductName: string;
    carbonSavingsPerUnit: number;
    quantity: number;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly base = 'http://localhost:8080/api/cart';

  constructor(private http: HttpClient) {}

  add(productId: number, quantity: number = 1): Observable<any> {
    return this.http.post(`${this.base}`, { productId, quantity });
  }

  getSummary(): Observable<CartSummaryResponse> {
    return this.http.get<CartSummaryResponse>(`${this.base}/summary`);
  }

  remove(itemId: number): Observable<any> {
    return this.http.delete(`${this.base}/${itemId}`);
  }

  update(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.base}/${itemId}`, { quantity });
  }

  // FINAL WORKING ONE-CLICK ECO SWAP
  swapToEco(cartItemId: number, newProductId: number): Observable<any> {
    return this.http.post(`${this.base}/swap`, {
      cartItemId,
      newProductId
    });
  }
}