import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, catchError, of, throwError } from 'rxjs';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiServerBaseUrl = 'http://51.91.100.173:8080';

  constructor(private cookieService: CookieService, private http: HttpClient) {}

  public getCurrentUser(): Observable<any> {
    const cookieExists = this.cookieService.check('access_token');
    if(!cookieExists) return of(null);

    const jwt = this.cookieService.get('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${jwt}`);
    
    return this.http.get<User>(`${this.apiServerBaseUrl}/user/me`, { headers });
  }

  public updateUser(username?: string, password?: string): Observable<any> {
    const jwt = this.cookieService.get('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${jwt}`);
    
    const updatedUser: any = {};

    if(username) updatedUser.username = username;
    if(password) updatedUser.password = password;

    return this.http.put(`${this.apiServerBaseUrl}/user/update`, updatedUser, { headers: headers })
    .pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }
}
