import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard  {
  private roles: string[];

  constructor(private authService: AuthService, private router: Router) {
    this.roles = ['ROLE_USER', 'ROLE_ADMIN'];
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated() && this.authService.hasAnyRole(this.roles))
      return true;
    else {
      this.router.navigate(['/']);
      return false;
    }
  }  
}