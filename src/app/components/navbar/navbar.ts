import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, NgIf],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class Navbar implements OnInit {
  isDark = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private theme: ThemeService
  ) {}

  ngOnInit(): void {
    this.isDark = this.theme.isDarkMode();
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
    this.isDark = this.theme.isDarkMode();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
