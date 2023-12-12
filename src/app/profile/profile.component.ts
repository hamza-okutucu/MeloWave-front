import { Component, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../model/User';
import { UserService } from '../service/user.service';
import { CookieService } from 'ngx-cookie-service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  user: User;
  profileForm: FormGroup;
  passwordInputType = 'password';

  constructor(
    private userService: UserService,
    private elementRef: ElementRef,
    private cookieService: CookieService,
    private jwtHelperService: JwtHelperService,
    private router: Router
  ) {
    this.profileForm = new FormGroup({
      role: new FormControl({ value: '', disabled: true }),
      username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
      password: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
    this.getCurrentUser();
  }

  getCurrentUser(): void {
    this.userService.getCurrentUser().subscribe(
      user => {
        this.user = user;
        this.setFormValues();
      },
      error => this.openModal('fetchUserErrorModal')
    );
  }

  setFormValues(): void {
    this.profileForm.patchValue({
      role: this.user.role.name,
      username: this.user.username,
      password: this.user.password
    });
  }

  openModal(modalName: string) {
    ($(this.elementRef.nativeElement).find('#' + modalName) as any).modal('show');
  }

  closeModal(modalName: string) {
    ($(this.elementRef.nativeElement).find('#' + modalName) as any).modal('hide');
  }
  
  togglePasswordVisibility() {
    this.passwordInputType = this.passwordInputType === 'password' ? 'text' : 'password';
  }

  update() {
    if (this.valuesChanged() && this.isUsernameValid() && this.isPasswordValid()) {
      const formValues = this.profileForm.value;
      const username = formValues.username !== this.user.username ? formValues.username : '';
      const password = formValues.password !== this.user.password ? formValues.password : '';
      this.userService
          .updateUser(username, password).subscribe(
            (response) => {
              this.cookieService.delete('access_token');
              this.createCookie('access_token', response.access_token);
              this.router.navigate(['/profile']);
              this.openModal('updateSuccessModal')
              setTimeout(() => {
                this.closeModal('updateSuccessModal');
              }, 5000);
            },
            (error) => this.openModal('updateErrorModal')
          );
    }
  }

  createCookie(cookieName: string, token: string): void {
    const expiration = this.getExpirationFromToken(token);
    const expirationDate = new Date(expiration * 1000);

    this.cookieService.set(cookieName, token, expirationDate, '/', '', true, 'Strict');
  }

  private getExpirationFromToken(token: string): number {
    const tokenData = this.jwtHelperService.decodeToken(token);
    const expiration = tokenData?.exp;

    return expiration || 0;
  }

  valuesChanged() {
    const formValues = this.profileForm.value;
    const isValid = formValues.username !== this.user.username || formValues.password !== this.user.password;
    if (!isValid) {
      this.openModal('noValueChangedErrorModal');
      setTimeout(() => {
        this.closeModal('noValueChangedErrorModal');
      }, 4000);
    }
    return isValid;
  }

  isUsernameValid() {
    const trimedUsername = this.profileForm.value.username.trim();
    return trimedUsername.length >= 3 && trimedUsername.length <= 20;
  }

  isPasswordValid() {
    return this.profileForm.value.password.trim() !== '';
  }
}
