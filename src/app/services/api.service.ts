import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationData } from '../interfaces/application-data';
import { Constants } from '../interfaces/constants';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://be-mortgage-calculator.onrender.com/api/v1';

  constants: Constants;

  constructor(private http: HttpClient) {}
  requestHeader = new HttpHeaders({ 'Content-type': 'application/json' });

  getConstants(): Observable<Constants> {
    return this.http.get<Constants>(`${this.apiUrl}/constants`);
  }
  putConstants(newConstants: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/constants`, newConstants, {
      headers: this.requestHeader,
    });
  }

  postApplication(applicationData: ApplicationData): Observable<any> {
    return this.http.post(`${this.apiUrl}/new-application`, applicationData);
  }

  checkEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/check-email?email=${email}`);
  }
}
