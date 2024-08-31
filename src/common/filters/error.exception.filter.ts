import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';

@Catch(HttpException)
export class GqlHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctxType = host.getType();

    if (ctxType === 'http') {
      // 如果是 HTTP 请求，处理 HTTP 响应
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status = exception.getStatus();
      const message = exception.message || 'Internal server error';
      const code = exception.getResponse()['code'] || 'INTERNAL_SERVER_ERROR';

      response
        .status(status)
        .json({
          statusCode: status,
          message: message,
          code: code,
        });
    } else  {
      // 如果是 GraphQL 请求，处理 GraphQL 异常
      const gqlHost = GqlArgumentsHost.create(host);
      const response = exception.getResponse();
      const message = exception.message;
      const status = exception.getStatus();
      const code = response['code'] || 'INTERNAL_SERVER_ERROR';
      const data = response['data'];

      // 如果有自定义信息，使用它；否则使用默认的消息
      throw new ApolloError(message, code, {
        statusCode: status,
        message: message,
        code: code,
        data: data,
      });
    }
  }
}
