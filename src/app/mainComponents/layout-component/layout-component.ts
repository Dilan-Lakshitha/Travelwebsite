import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ScrollToToComponent } from '../../sharedComponents/scroll-to-to-component/scroll-to-to-component';

@Component({
  selector: 'app-layout-component',
  standalone: true,
  imports: [CommonModule, ScrollToToComponent, RouterModule],
  templateUrl: './layout-component.html',
  styleUrl: './layout-component.css',
})
export class LayoutComponent implements OnInit {
  activeLang = 'en';

  async ngOnInit() {
    const savedLang = localStorage.getItem('preferred_lang');
    if (savedLang) {
      this.activeLang = savedLang;
      this.applyGoogleTranslate(savedLang);
      return;
    }

    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      console.log('Detected country:', data.country);

      const countryToLang: Record<string, string> = {
        LK: 'si',
        IT: 'it',
        FR: 'fr',
        DE: 'de',
        ES: 'es',
      };

      const detectedLang = countryToLang[data.country];

      if (detectedLang) {
        this.activeLang = detectedLang;
        localStorage.setItem('preferred_lang', detectedLang);
        this.applyGoogleTranslate(detectedLang);
      }
    } catch (e) {
      console.warn('IP detection failed');
    }
  }

  changeLang(lang: string) {
    this.activeLang = lang;
    localStorage.setItem('preferred_lang', lang);
    this.applyGoogleTranslate(lang);
  }

  private applyGoogleTranslate(lang: string) {
    const interval = setInterval(() => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
        clearInterval(interval);
      }
    }, 300);
  }
}
