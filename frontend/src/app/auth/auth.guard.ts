// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isAuthenticated.pipe(
      take(1),
      map(isAuthenticated => {
        const tokenValid = this.authService.isLoggedIn();
        const user = this.authService.getCurrentUser();
        const allowedRoles = route.data['roles'] as string[] | undefined;

        if (isAuthenticated && tokenValid) {
          if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            console.warn('🚫 Role not allowed');
            this.router.navigate(['/unauthorized']); // Create this route if needed
            return false;
          }
          return true;
        }

        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}