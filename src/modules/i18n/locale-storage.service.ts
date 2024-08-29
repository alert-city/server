import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class LocaleStorageService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

  setLocale(locale: string) {
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      store.set('locale', locale);
    }
  }

  getLocale(): string | undefined {
    const store = this.asyncLocalStorage.getStore();
    return store ? store.get('locale') : undefined;
  }

  run(fn: () => void) {
    this.asyncLocalStorage.run(new Map(), fn);
  }
}