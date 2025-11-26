import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = '/api/auth'; // ← Proxy handles localhost:8080

  // Optional: reactive way to track login state
  private loggedIn = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, data).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.role);     // "ROLE_USER", "ROLE_SELLER", "ROLE_ADMIN"
          localStorage.setItem('name', res.name || res.email?.split('@')[0] || 'User');
          localStorage.setItem('email', res.email);

          this.loggedIn.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.clear();
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getName(): string {
    return localStorage.getItem('name') || 'User';
  }

  getEmail(): string {
    return localStorage.getItem('email') || '';
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isAdmin(): boolean {
    return this.getRole() === 'ROLE_ADMIN';
  }

  isSeller(): boolean {
    return this.getRole() === 'ROLE_SELLER';
  }

  isUser(): boolean {
    return this.getRole() === 'ROLE_USER';
  }

  // Reactive login state (optional but nice)
  loggedIn$ = this.loggedIn.asObservable();
}