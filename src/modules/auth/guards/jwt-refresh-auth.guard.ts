import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh-token') {
  getRequest(context: ExecutionContext): Request {
    // console.log('开始验证 refresh token');
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
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
