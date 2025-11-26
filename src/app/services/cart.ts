import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private base = 'http://localhost:8080/api/cart';

  constructor(private http: HttpClient) {}

  // Add item
  add(productId: number, quantity: number = 1): Observable<any> {
    return this.http.post(this.base, { productId, quantity });
  }

  // Get all user cart items + summary DTO
  getSummary(): Observable<any> {
    return this.http.get(this.base);
  }

  // Remove one item entirely
  remove(itemId: number): Observable<any> {
    return this.http.delete(`${this.base}/${itemId}`);
  }

  // Update quantity (optional improvement)
  update(itemId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.base}`, { id: itemId, quantity });
  }
}
