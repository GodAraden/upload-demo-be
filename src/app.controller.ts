import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { writeFile } from 'fs/promises';

// FIXME: 实际项目中会有权限校验，已登录的用户才可以上传文件
@Controller()
export class AppController {
  private file: Map<string, CustomFile> = new Map();
  // FIXME: 实际肯定不能直接把文件块扔到缓存里面，因为这里是 demo 就这样写了
  private cache: Map<string, CustomChunk[]> = new Map();

  @Post('create')
  createFile(@Body() params: CreateFileParams) {
    // TODO: 在数据库中查找是否已有相同文件，若有返回对应的记录

    // 在文件记录缓存中添加一条记录，若已经存在则返回先前的记录
    if (!this.file.has(params.fileId)) {
      this.file.set(params.fileId, {
        filename: params.filename,
        total: params.total,
        upload: 0,
      });
    }

    return {
      ...this.file.get(params.fileId),
      chunks: this.cache.get(params.fileId)?.map((chunk) => chunk.order) ?? [],
    };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('chunk'))
  upLoadChunk(
    @UploadedFile() chunk: Express.Multer.File,
    @Body() params: UploadChunkParams,
  ) {
    params.order = Number(params.order);
    params.size = Number(params.size);

    // 在 Chunk 缓存中添加缓存，并更新文件记录缓存中的记录
    if (!this.cache.has(params.fileId)) this.cache.set(params.fileId, []);
    this.cache
      .get(params.fileId)
      .push({ chunk: chunk.buffer, order: params.order, size: params.size });

    // 更新文件记录并返回之
    const file = this.file.get(params.fileId);
    file.upload += params.size;

    return file;
  }

  @Post('merge')
  async mergeChunks(@Body() params: MergeChunkParams) {
    const { fileId } = params;

    // 拼接缓存中的文件块
    const chunks = this.cache.get(fileId);
    const file = this.file.get(fileId);

    const result = new Uint8Array(file.total);
    let length = 0;
    for (const chunk of chunks) {
      result.set(chunk.chunk, length);
      length += chunk.size;
    }
    await writeFile(`assets/${file.filename}`, result);

    // TODO: 此处记录文件到数据库

    this.cache.delete(fileId);
    this.file.delete(fileId);

    return file;
  }
}
