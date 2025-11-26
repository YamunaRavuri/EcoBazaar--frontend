import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {

  private baseUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) {}

  getSellerReport(): Observable<any> {
    return this.http.get(`${this.baseUrl}/seller`);
  }

  getUserReport(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user`);
  }

  getSellerSales(days: number = 7): Observable<any> {
    return this.http.get(`${this.baseUrl}/seller/sales?days=${days}`);
  }
}
