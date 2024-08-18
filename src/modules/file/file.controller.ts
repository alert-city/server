import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { GridFsService } from './file.service';
import { UseGuards } from '@nestjs/common';
import { CombinedAuthGuard } from '@/modules/auth/guards/combined-auth.guard';

@Controller('files')
export class FilesController {
  constructor(private readonly gridFsService: GridFsService) {}

  @Get(':id')
  @UseGuards(CombinedAuthGuard)
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    // 获取文件的元数据，包括文件名和 MIME 类型
    const file = await this.gridFsService.getFileMetadata(id);
    if (!file) {
      return res.status(HttpStatus.NOT_FOUND).send('File not found');
    }
    const fileStream = await this.gridFsService.getFile(id);

    // Optional: Set custom headers for the file, like Content-Type and Content-Disposition
    res.set({
      'Content-Type': file.contentType, // 动态设置 MIME 类型
      'Content-Disposition': `attachment; filename="${file.filename}"`, // 动态设置文件名
    });

    // Pipe the file stream directly to the response
    fileStream.pipe(res).on('error', (err) => {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Failed to download file');
    });
  }
}