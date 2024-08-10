import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { z, ZodError } from 'zod';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class ZodValidationInterceptor implements NestInterceptor {
  constructor(private schema: z.ZodSchema<any>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context); // 获取 GraphQL 上下文
    const request = gqlContext.getContext().req; // 从 GraphQL 上下文中获取请求

    try {
      this.schema.parse(request.body.variables.input); // 验证请求体
    } catch (error) {
      if (error instanceof ZodError) {
        // console.log("error", error);
        throw new BadRequestException(error.errors);
      }
    }
    return next.handle();
  }
}