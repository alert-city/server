import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { ReadStream } from 'fs';
import { UserService } from '@/modules/user/user.service';
import { TokenService } from '@/modules/auth/token.service';
import { ConfigService } from '@nestjs/config';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => ReadStream;
}

@Injectable()
export class GridFsService {
  private gridFsBucket: GridFSBucket;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {
    this.gridFsBucket = new GridFSBucket(this.connection.db);
  }

  async getFileMetadata(id: string): Promise<any> {
    const file = await this.gridFsBucket.find({ _id: new ObjectId(id) }).toArray();
    return file[0];
  }

  async uploadFile(
    file: FileUpload,
    context: any,
  ): Promise<any> {
    const { createReadStream, filename } = file;
    const uploadStream = this.gridFsBucket.openUploadStream(filename);
    createReadStream().pipe(uploadStream);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const fileId = uploadStream.id;
    const fileUrl = `${frontendUrl}/files/${fileId}`;
    const req = context.req;
    const { id } = await this.tokenService.processToken(req);

    await this.userService.updateUser(id, { avatarUrl: fileUrl });

    return new Promise((
      resolve,
      reject,
    ) => {
      uploadStream.on('finish', () => resolve({ _id: uploadStream.id, filename }));
      uploadStream.on('error', reject);
    });
  }

  async getFile(fileId: string): Promise<any> {
    return this.gridFsBucket.openDownloadStream(new ObjectId(fileId));
  }

  async deleteFile(id:string, fileId: string): Promise<any> {
    await this.gridFsBucket.delete(new ObjectId(fileId));
    await this.userService.updateUser(id, { avatarUrl: '' });
    return true;
  }

}
