import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';

import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSpinnerModule, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('ecobazaar-frontend');

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    document.documentElement.classList.toggle('dark', isDark);
  }
}
