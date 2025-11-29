import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
  role: string;
  name?: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = '/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.role);
          localStorage.setItem('email', res.email);
          localStorage.setItem('name', res.name || res.email.split('@')[0] || 'User');
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

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.hasToken();
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

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}