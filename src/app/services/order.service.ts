import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private base = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  checkout(): Observable<any> {
    return this.http.post(`${this.base}/checkout`, {});
  }
}
