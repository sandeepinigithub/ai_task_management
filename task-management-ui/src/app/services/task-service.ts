import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly base = `${environment.baseUrl}`;

  constructor(private http: HttpClient) { }

  getTasks(params?: any) {
    return this.http.get(`${this.base}/api/tasks`, { params });
  }
  getDashboardSummary() {
    return this.http.get(`${this.base}/api/tasks/dashboard/summary`);
  }
  getRecentTasks() {
    return this.http.get(`${this.base}/api/tasks/dashboard/recent`);
  }

  getTaskById(id: string) {
    return this.http.get(`${this.base}/api/tasks/${id}`);
  }

  createTask(payload: any) {
    return this.http.post(`${this.base}/api/tasks`, payload);
  }

  updateTask(id: string, payload: any) {
    return this.http.patch(`${this.base}/api/tasks/${id}`, payload);
  }

  deleteTask(id: string) {
    return this.http.delete(`${this.base}/api/tasks/${id}`);
  }
}
