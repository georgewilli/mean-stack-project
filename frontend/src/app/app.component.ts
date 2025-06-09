import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, User } from './auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
  constructor(private router: Router, private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser;
    this.isAuthenticated$ = this.authService.isAuthenticated;
  }
  


  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
