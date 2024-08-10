import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class GoogleOAuthGuard extends AuthGuard('google') implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const activate = (await super.canActivate(context)) as boolean;
    const ctx = context.switchToHttp();
    const res = ctx.getResponse();

    // 如果使用 GraphQL，这里可以在前端通过响应的 URL 进行跳转
    if (res.redirect) {
      res.redirect('/');
    }

    return activate;
  }
}