import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { GridFsService } from './file.service';
import { FileUpload } from './file.service';
import { GraphQLUpload } from 'graphql-upload/public/index.js';
import { UseGuards } from '@nestjs/common';
import { CombinedAuthGuard } from '@/modules/auth/guards/combined-auth.guard';

@Resolver()
export class FileResolver {
  constructor(private readonly gridFsService: GridFsService) {
  }

  @Query(() => String)
  @UseGuards(CombinedAuthGuard)
  async downloadFile(@Args('fileId') fileId: string): Promise<string> {
    const fileStream = await this.gridFsService.getFile(fileId);
    const chunks: Uint8Array[] = [];

    return new Promise((
      resolve,
      reject,
    ) => {
      fileStream.on('data', (chunk: any) => chunks.push(chunk));
      fileStream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer.toString('base64')); // 返回 base64 编码
      });
      fileStream.on('error', reject);
    });
  }

  @Mutation(() => String)
  @UseGuards(CombinedAuthGuard)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
    @Context() context: any,
  ): Promise<string> {
    const result = await this.gridFsService.uploadFile(file, context);
    return result._id.toString();
  }

  @Mutation(() => Boolean)
  @UseGuards(CombinedAuthGuard)
  async deleteFile(
    @Args('fileId') fileId: string,
    @Context() context: any): Promise<boolean> {
    const { id } = context.req.user;
    return await this.gridFsService.deleteFile(id, fileId);
  }
}