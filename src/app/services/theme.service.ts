import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly key = 'theme';

  constructor() {
    this.applyInitialTheme();
  }

  private applyInitialTheme(): void {
    const saved = localStorage.getItem(this.key);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', isDark);
  }

  toggleTheme(): void {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(this.key, isDark ? 'dark' : 'light');
  }

  setTheme(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(this.key, dark ? 'dark' : 'light');
  }

  isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark');
  }
}
