import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { UserService } from '@/modules/user/services/user.service';
import { TokenService } from '@/modules/auth/token.service';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

export interface FileUpload {
  createReadStream: () => Readable; // 将 ReadStream 修改为 Readable
  filename: string;
  mimetype: string;
  encoding: string;
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
    req: any,
  ): Promise<any> {
    const { createReadStream, filename } = file;
    const uploadStream = this.gridFsBucket.openUploadStream(filename);
    createReadStream().pipe(uploadStream);

    const backendUrl = this.configService.get<string>('BACKEND_URL');
    const fileId = uploadStream.id;
    const fileUrl = `${backendUrl}/files/${fileId}`;
    const { id } = await this.tokenService.processToken(req);
    await this.userService.updateUser(id, { avatarUrl: fileUrl });
    return new Promise((
      resolve,
      reject,
    ) => {
      uploadStream.on('finish', async () => {
        resolve({ _id: uploadStream.id, filename, fileUrl });
      })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async getFile(fileId: string): Promise<any> {
    return this.gridFsBucket.openDownloadStream(new ObjectId(fileId));
  }

  async deleteFile(id: string, fileId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        resolve(false);
      }, 10000);
      this.gridFsBucket.delete(new ObjectId(fileId))
        .then(() => {
          clearTimeout(timeoutId);
          resolve(true);
        })
        .catch(() => {
          clearTimeout(timeoutId);
          resolve(true);
        });
    });
  }

}
