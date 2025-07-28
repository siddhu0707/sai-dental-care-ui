import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, SupportedLanguage } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="language-switcher">
      <button 
        *ngFor="let lang of languages" 
        (click)="switchLanguage(lang.code)"
        [class.active]="currentLanguage === lang.code"
        class="language-btn"
        [title]="lang.name"
      >
        <span class="flag">{{ lang.flag }}</span>
        <span class="lang-code">{{ lang.code.toUpperCase() }}</span>
      </button>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    
    .language-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .language-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }
    
    .language-btn.active {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .flag {
      font-size: 1rem;
    }
    
    .lang-code {
      font-size: 0.75rem;
      font-weight: 600;
    }
  `]
})
export class LanguageSwitcherComponent {
  currentLanguage: SupportedLanguage = 'en';
  
  languages = [
    { code: 'en' as SupportedLanguage, name: 'English', flag: '🇺🇸' },
    { code: 'mr' as SupportedLanguage, name: 'मराठी', flag: '🇮🇳' }
  ];

  constructor(private translationService: TranslationService) {
    this.translationService.currentLanguage$.subscribe(
      language => this.currentLanguage = language
    );
  }

  switchLanguage(language: SupportedLanguage): void {
    this.translationService.setLanguage(language);
  }
}
