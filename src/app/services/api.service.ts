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

  postApplication(applicationData: ApplicationData): Observable<any> {
    return this.http.post(`${this.apiUrl}/new-application`, applicationData);
  }

  checkEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/check-email?email=${email}`);
  }

  getApplicationForUser(userId: number): Observable<ApplicationData[]> {
    return this.http.get<ApplicationData[]>(
      `${this.apiUrl}/users/${userId}/applications`
    );
  }

  // listApplications(newConstants: any): Observable<ApplicationData[]> {
  //   return this.http.put<ApplicationData[]>(
  //     `${this.apiUrl}/users/{userId}/applications`,
  //     newConstants,
  //     {
  //       headers: this.requestHeader,
  //     }
  //   );
  // }
  // listApplications(): Observable<ApplicationData[]> {
  //   const headers = new HttpHeaders({
  //     Authorization: 'Bearer ' + localStorage.getItem('access_token'),
  //   });
  //   return this.http.get<ApplicationData[]>(
  //     this.apiUrl + 'users/{userId}/applications',
  //     { headers }
  //   );
  // }
}
