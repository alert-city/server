import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh-token') {
  getRequest(context: ExecutionContext): Request {
    if (context.getType() === 'http') {
      // 如果是 HTTP 请求，返回 HTTP 请求的 req 对象
      return context.switchToHttp().getRequest();
    } else  {
      // 如果是 GraphQL 请求，返回 GraphQL 上下文中的 req 对象
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }

  }

  handleRequest(err: any,
                user: any,
                info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Both tokens are invalid');
    }
    // console.log("refreshToken有效");
    return user;
  }
}
