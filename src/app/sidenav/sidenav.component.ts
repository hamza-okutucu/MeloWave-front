import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../service/auth.service';
import { User } from '../model/User';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
  username: string;
  password: string;

  constructor(
    private elementRef: ElementRef,
    private cookieService: CookieService,
    private jwtHelperService: JwtHelperService,
    private authService : AuthService,
    private router: Router
  ) {
    this.username = '';
    this.password = '';
  }

  isUserLoggedIn() {
    return this.authService.isAuthenticated();
  }

  openModal(modalName: string) {
    ($(this.elementRef.nativeElement).find('#' + modalName) as any).modal('show');
  }

  closeModal(modalName: string) {
    ($(this.elementRef.nativeElement).find('#' + modalName) as any).modal('hide');
  }

  register() {
    if (this.isUsernameValid() && this.isPasswordValid()) {
      this.authService.createUser(this.username, this.password).subscribe(
        (user : User) => {
          this.openModal('registrationSuccessModal')
          setTimeout(() => {
            this.closeModal('registrationSuccessModal');
          }, 5000);
        },
        (error: HttpErrorResponse) => {
          console.log(error.status);
          if (error.status === 409) this.openModal('usernameTakenModal');
          else this.openModal('registrationErrorModal');
        }
      );
    }
  }

  isUsernameValid(): boolean {
    let trimedUsername = this.username.trim();
    return trimedUsername.length >= 3 && trimedUsername.length <= 20;
  }

  isPasswordValid(): boolean {
    return this.password.trim() !== '';
  }

  createCookie(cookieName: string, token: string): void {
    const expiration = this.getExpirationFromToken(token);
    const expirationDate = new Date(expiration * 1000);

    const secureFlag = window.location.protocol === 'https:';
  
    this.cookieService.set(cookieName, token, expirationDate, '/', '', secureFlag, 'Strict');
  }

  private getExpirationFromToken(token: string): number {
    const tokenData = this.jwtHelperService.decodeToken(token);
    const expiration = tokenData?.exp;

    return expiration || 0;
  }

  login() {
    if (this.isUsernameValid() && this.isPasswordValid()) {
      this.authService.login(this.username, this.password).subscribe(
        (token : string) => {
          this.createCookie('access_token', token);
          this.closeModal('loginModal');
          this.router.navigate(['/']);
          this.openModal('loginSuccessModal')
          setTimeout(() => {
            this.closeModal('loginSuccessModal');
          }, 3000);
        },
        error => this.openModal('loginErrorModal')
      );
    }
  }

  logout() {
    this.authService.logout();
  }
}
