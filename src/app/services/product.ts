import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private base = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.base);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.base, product);
  }

  getSellerProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/seller`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  update(id: number, data: any): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, data);
  }

  getAiSuggestions(productId: number): Observable<Product[]> {
    const params = new HttpParams().set('productId', productId.toString());
    return this.http.get<Product[]>(`${this.base}/ai/suggestions`, { params });
  }
}