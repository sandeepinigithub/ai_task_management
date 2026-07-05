import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly base = `${environment.baseUrl}`;

  constructor(private http: HttpClient) { }

  getUsers(params?: any) {
    return this.http.get(`${this.base}/api/users`, { params });
  }

  getUserById(id: string) {
    return this.http.get(`${this.base}/api/users/${id}`);
  }

  createUser(payload: any) {
    return this.http.post(`${this.base}/api/users`, payload);
  }

  updateUser(id: string, payload: any) {
    return this.http.patch(`${this.base}/api/users/${id}`, payload);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.base}/api/users/${id}`);
  }
  getUsersMasterList(params?: any) {
    return this.http.get(`${this.base}/api/users/master-list`, { params });
  }
}
