import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
  
    // Add debugging to see what requests are being intercepted
    console.log('🔍 Intercepting request:', req.url, req.method);
  
    // Skip interceptor for certain requests to prevent loops
    if (req.url.includes('/login') || 
        req.url.includes('/auth') || 
        req.url.includes('/refresh') ||
        req.url.includes('.json') ||  // Skip config files
        req.url.includes('assets/')) { // Skip static assets
      console.log('⏭️ Skipping auth for:', req.url);
      return next(req);
    }
  
    // Add auth header if token exists
    const token = authService.getToken();
    console.log('🔐 Token exists:', !!token);
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ Added auth header to:', req.url);
    }
  
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('❌ HTTP Error:', error.status, error.url);
        
        // Handle 401 Unauthorized responses
        if (error.status === 401) {
          console.log('🚪 Logging out due to 401');
          
          // Prevent infinite loops by checking current route
          const currentUrl = router.url;
          if (currentUrl !== '/login') {
            authService.logout();
            router.navigate(['/login']);
          }
        }
        return throwError(() => error);
      })
    );
  };
  
  // ALTERNATIVE: More selective interceptor
  