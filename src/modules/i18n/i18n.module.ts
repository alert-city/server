import { Global, Module } from '@nestjs/common';
import { I18nService } from './i18n.service';
import { LocaleStorageService } from './locale-storage.service';

@Global()
@Module({
  providers: [I18nService, LocaleStorageService],
  exports: [I18nService, LocaleStorageService],
})
export class I18nModule {}