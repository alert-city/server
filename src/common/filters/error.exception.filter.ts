import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';

@Catch(HttpException)
export class GqlHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctxType = host.getType();

    if (ctxType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      const message = exceptionResponse?.message || 'Internal server error';
      const code = exceptionResponse?.code || 'Customized Code Here';
      const data = exceptionResponse?.data || null;
      const request = ctx.getRequest();
      const path = request.url;

      response
        .status(status)
        .json({
          statusCode: status,
          message: message,
          code: code,
          data: data,
          path: path,
        });
    } else  {
      const gqlHost = GqlArgumentsHost.create(host);
      const gqlInfo = gqlHost.getInfo();
      const operationName = gqlInfo.operation.name?.value;
      const fieldName = gqlInfo.fieldName;
      const response = exception.getResponse() as any;
      const message = response?.message || 'Internal server error';
      const statusCode = exception.getStatus();
      const data = response?.data || null;
      const code = response?.code || 'Customized Code Here';

      throw new ApolloError(message,code, {
        status: statusCode,
        message: message,
        data: data,
        operationName: operationName,
        fieldName: fieldName,
      });
    }
  }
}
