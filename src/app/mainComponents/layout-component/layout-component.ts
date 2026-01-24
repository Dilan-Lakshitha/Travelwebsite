import { Component } from '@angular/core';
import { HomePageComponent } from '../home-page-component/home-page-component';
import { ScrollToToComponent } from '../../sharedComponents/scroll-to-to-component/scroll-to-to-component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout-component',
  standalone: true,
  imports: [CommonModule, ScrollToToComponent, RouterModule],
  templateUrl: './layout-component.html',
  styleUrl: './layout-component.css',
})
export class LayoutComponent {
  activeLang = 'en';
  ngOnInit() {
    const savedLang = localStorage.getItem('preferred_lang');
    if (savedLang) {
      setTimeout(() => {
        const dropdown = document.getElementById(
          'langSwitcher'
        ) as HTMLSelectElement;
        if (dropdown) dropdown.value = savedLang;
      }, 500);
    }
  }

  changeLang(lang: string) {
    this.activeLang = lang;
    localStorage.setItem('preferred_lang', lang);
    this.applyGoogleTranslate(lang);
  }

  private applyGoogleTranslate(lang: string) {
    const interval = setInterval(() => {
      const select = document.querySelector(
        '.goog-te-combo'
      ) as HTMLSelectElement;
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
        clearInterval(interval);
      }
    }, 300);
  }
}
