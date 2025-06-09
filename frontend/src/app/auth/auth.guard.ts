// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    console.log('🛡️ AuthGuard: canActivate called');
    console.log('📍 Route:', state.url);
    console.log('🎯 Route params:', route.params);
    console.log('❓ Query params:', route.queryParams);

    return this.authService.isAuthenticated.pipe(
      take(1),
      tap(isAuthenticated => {
        console.log('🔍 AuthService.isAuthenticated observable value:', isAuthenticated);
        console.log('🔐 AuthService.isLoggedIn() method result:', this.authService.isLoggedIn());
        console.log('🎫 Current token:', this.authService.getToken() ? 'EXISTS' : 'MISSING');
      }),
      map(isAuthenticated => {
        const bothChecksPass = isAuthenticated && this.authService.isLoggedIn();
        console.log('✅ Both auth checks pass:', bothChecksPass);
        
        if (bothChecksPass) {
          console.log('🚀 AuthGuard: ALLOWING access to', state.url);
          return true;
        } else {
          console.log('🚫 AuthGuard: BLOCKING access to', state.url);
          console.log('🔄 Redirecting to /login with returnUrl:', state.url);
          
          // Check if already on login to prevent infinite redirect
          if (state.url === '/login') {
            console.log('⚠️ Already on login page, allowing access');
            return true;
          }
          
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url } 
          }).then(success => {
            console.log('🧭 Navigation to /login success:', success);
          }).catch(error => {
            console.error('❌ Navigation to /login failed:', error);
          });
          
          return false;
        }
      }),
      catchError(error => {
        console.error('💥 AuthGuard error:', error);
        console.log('🔄 Redirecting to /login due to error');
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}

// ALTERNATIVE: Simplified version for testing
export class AuthGuardSimple implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('🛡️ SimpleAuthGuard: Checking route:', state.url);
    
    const hasToken = !!this.authService.getToken();
    console.log('🎫 Has token:', hasToken);
    
    if (hasToken) {
      console.log('✅ Access granted');
      return true;
    } else {
      console.log('🚫 No token, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }
  }
}