// src/graphql-upload.d.ts

declare module 'graphql-upload' {
  import { GraphQLScalarType } from 'graphql';
  import type { RequestHandler } from 'express';

  export const GraphQLUpload: GraphQLScalarType;

  export interface FileUpload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => NodeJS.ReadableStream;
  }

  export const graphqlUploadExpress: () => RequestHandler;
}

declare module 'graphql-upload/public/index.js' {
  export * from 'graphql-upload';
}