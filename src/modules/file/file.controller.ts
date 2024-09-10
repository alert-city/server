import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { GridFsService } from './file.service';
import { CombinedAuthGuard } from '@/modules/auth/guards/combined-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';

@Controller('files')
export class FilesController {
  constructor(private readonly gridFsService: GridFsService) {}

  @Get(':id')
  @UseGuards(CombinedAuthGuard)
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.gridFsService.getFileMetadata(id);
    if (!file) {
      return res.status(HttpStatus.NOT_FOUND).send('File not found');
    }
    const fileStream = await this.gridFsService.getFile(id);

    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
    });

    fileStream.pipe(res).on('error', () => {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Failed to download file');
    });
  }

  @Post('upload')
  @UseGuards(CombinedAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return await this.gridFsService.uploadFile(
      {
        createReadStream: () => Readable.from(file.buffer),
        filename: file.originalname,
        mimetype: file.mimetype,
        encoding: file.encoding,
      },
      req,
    );
  }
}
