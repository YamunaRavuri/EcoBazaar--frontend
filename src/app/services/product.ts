import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> { return this.http.get<Product[]>(this.base); }
  getById(id:number): Observable<Product> { return this.http.get<Product>(`${this.base}/${id}`); }
  create(product: Partial<Product>) { return this.http.post<Product>(this.base, product); }
  getSellerProducts(): Observable<Product[]> { return this.http.get<Product[]>(`${this.base}/seller`); }
  delete(id:number) { return this.http.delete(`${this.base}/${id}`); }
  update(id:number, data:any) { return this.http.put(`${this.base}/${id}`, data); }
}

