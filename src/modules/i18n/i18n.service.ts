import { Injectable } from '@nestjs/common';
import * as en from '@/i18n/en.json';
import * as zhCn from '@/i18n/zh-cn.json';
import { LocaleStorageService } from './locale-storage.service';

@Injectable()
export class I18nService {
  private readonly translations = { en, zhCn };

  constructor(private readonly localeStorageService: LocaleStorageService) {}

  getTranslation(key: string): string {
    let locale = this.localeStorageService.getLocale() || 'en';
    if (locale === 'zh-cn') {
      locale = 'zhCn';
    }
    const translations = this.translations[locale] || this.translations['en'];
    return key.split('.').reduce((obj, path) => obj?.[path], translations);
  }
}
