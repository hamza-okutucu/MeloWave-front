import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { Observable, map } from 'rxjs';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiServerBaseUrl = 'http://localhost:8080/api/v1';

  constructor(private cookieService: CookieService, private http: HttpClient, private jwtHelperService: JwtHelperService) {}

  public createUser(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiServerBaseUrl}/user/create`, {'username': username, 'password': password});
  }
  
  public login(username: string, password: string): Observable<any> {
    const params = new HttpParams()
                    .set("username", username)
                    .set("password", password);

    return this
            .http
            .post<string>(`${this.apiServerBaseUrl}/login`, null, { params, responseType: 'text' as 'json' })
            .pipe(
              map(response => {
                const token = JSON.parse(response);
                return token["access_token"];
              })
            );
  }

  public logout(): void {
    this.cookieService.delete('access_token');
  }

  public isAuthenticated(): boolean {
    const cookieExists = this.cookieService.check('access_token');
    if(!cookieExists) return false;

    const token = this.cookieService.get('access_token');
    
    if(token) {
      const isTokenExpired = this.jwtHelperService.isTokenExpired(token);
      
      if(isTokenExpired)
        this.cookieService.delete('access_token');
      
      return !isTokenExpired;
    }

    return false;
  }

  public hasAnyRole(roles: string[]): boolean {
    const token = this.cookieService.get('access_token');
    
    if(token) {
      const decodedToken = this.jwtHelperService.decodeToken(token);
      return decodedToken && this.isSubsetOfArray(decodedToken.roles, roles);
    }

    return false;
  }

  private isSubsetOfArray(subset: string[], array: string[]): boolean {
    for (const element of subset) {
      if (!array.includes(element))
        return false;
    }
    return true;
  }
}
