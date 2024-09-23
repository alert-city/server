import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LocaleStorageService } from './locale-storage.service';

@Injectable()
export class LocaleMiddleware implements NestMiddleware {
  constructor(private readonly localeStorageService: LocaleStorageService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const locale = req.cookies?.NEXT_LOCALE || 'en';

    // 使用 AsyncLocalStorage 运行
    this.localeStorageService.run(() => {
      this.localeStorageService.setLocale(locale); // 存储 locale
      next();
    });
  }
}
