import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private _httpClient: HttpClient) {

  }

  login(payload: any) {
    return this._httpClient.post(`${environment.baseUrl}/api/auth/login`, payload);
  }

  register(payload: any) {
    return this._httpClient.post(`${environment.baseUrl}/api/auth/register`, payload);
  }

  logout(): void {
    sessionStorage.clear();
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getUserDetails(): string | null {
    return JSON.parse(sessionStorage.getItem('userDetails') || '');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
