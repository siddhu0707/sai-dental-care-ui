import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslationService, SupportedLanguage } from '../services/translation.service';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription: Subscription;
  private currentLanguage: SupportedLanguage = 'en';

  constructor(private translationService: TranslationService) {
    this.subscription = this.translationService.currentLanguage$.subscribe(
      (language) => this.currentLanguage = language
    );
  }

  transform(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
