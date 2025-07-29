import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, SupportedLanguage } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.css']
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
