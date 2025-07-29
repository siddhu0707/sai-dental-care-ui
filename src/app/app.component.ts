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
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
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
