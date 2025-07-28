import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HealthCheckService } from './services/health-check.service';
import { TranslatePipe } from './pipes/translate.pipe';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, TranslatePipe, LanguageSwitcherComponent],
  template: `
    <div class="app-container">
      <nav class="sidebar">
        <div class="sidebar-header">
          <div class="logo-container">
            <div class="logo">🦷</div>
            <div class="clinic-info">
              <h2 class="clinic-name">{{ 'clinic.name' | translate }}</h2>
              <p class="clinic-subtitle">{{ 'clinic.subtitle' | translate }}</p>
            </div>
          </div>
          <div class="language-switcher-container">
            <app-language-switcher></app-language-switcher>
          </div>
        </div>
        
        <ul class="nav-menu">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📊</span>
              <span class="nav-text">{{ 'nav.dashboard' | translate }}</span>
            </a>
          </li>
          <li>
            <a routerLink="/patients" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">👥</span>
              <span class="nav-text">{{ 'nav.patients' | translate }}</span>
            </a>
          </li>
          <li>
            <a routerLink="/appointments" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📅</span>
              <span class="nav-text">{{ 'nav.appointments' | translate }}</span>
            </a>
          </li>
          <li>
            <a routerLink="/billing" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">💰</span>
              <span class="nav-text">{{ 'nav.billing' | translate }}</span>
            </a>
          </li>
        </ul>
        
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">👨‍⚕️</div>
            <div class="user-details">
              <p class="user-name">Dr. Smith</p>
              <p class="user-role">Administrator</p>
            </div>
          </div>
        </div>
      </nav>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      background: #f8fafc;
    }
    
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .language-switcher-container {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .clinic-info {
      flex: 1;
    }

    .clinic-name {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: white;
    }

    .clinic-subtitle {
      margin: 0.5rem 0 0 0;
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .nav-menu {
      flex: 1;
      list-style: none;
      padding: 1rem 0;
      margin: 0;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;
    }
    
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .nav-item.active {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border-left-color: #7dd3fc;
    }
    
    .nav-icon {
      font-size: 1.2rem;
      margin-right: 0.75rem;
    }
    
    .nav-text {
      font-weight: 500;
    }
    
    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .user-info {
      display: flex;
      align-items: center;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      margin-right: 0.75rem;
    }
    
    .user-name {
      margin: 0;
      font-weight: 600;
      font-size: 0.9rem;
    }
    
    .user-role {
      margin: 0.25rem 0 0 0;
      font-size: 0.8rem;
      opacity: 0.7;
    }
    
    .main-content {
      flex: 1;
      overflow-y: auto;
      background: #f8fafc;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        position: fixed;
        z-index: 1000;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .sidebar.mobile-open {
        transform: translateX(0);
      }
      
      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'sai-dental-care-ui';

  constructor(private healthCheck: HealthCheckService) {}

  ngOnInit() {
    // Test API connection on app startup
    setTimeout(() => {
      this.healthCheck.testConnection();
    }, 2000); // Wait 2 seconds for servers to be ready
  }
}
