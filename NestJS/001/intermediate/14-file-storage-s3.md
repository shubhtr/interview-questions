# Question 34: How do you implement file storage with AWS S3 in NestJS?

## Answer

You can use `@nestjs/platform-express` with `multer` and `aws-sdk` or `@aws-sdk/client-s3` to upload files to AWS S3.

## Example:

```typescript
// Install: npm install @aws-sdk/client-s3 multer
// Install: npm install -D @types/multer

// s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.configService.get('AWS_S3_BUCKET');
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = '',
  ): Promise<string> {
    const key = folder
      ? `${folder}/${Date.now()}-${file.originalname}`
      : `${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    await this.s3Client.send(command);
    return key;
  }

  async getFileUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    return url;
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = '',
  ): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }
}

// files.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Param,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';

@Controller('files')
export class FilesController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    const key = await this.s3Service.uploadFile(file, folder);
    const url = await this.s3Service.getFileUrl(key);

    return {
      key,
      url,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder?: string,
  ) {
    const keys = await this.s3Service.uploadMultipleFiles(files, folder);
    const urls = await Promise.all(
      keys.map((key) => this.s3Service.getFileUrl(key)),
    );

    return files.map((file, index) => ({
      key: keys[index],
      url: urls[index],
      originalName: file.originalname,
      size: file.size,
    }));
  }

  @Get(':key')
  async getFileUrl(@Param('key') key: string) {
    const url = await this.s3Service.getFileUrl(key);
    return { url };
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string) {
    await this.s3Service.deleteFile(key);
    return { message: 'File deleted successfully' };
  }
}

// files.module.ts
import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { S3Service } from './s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [S3Service],
})
export class FilesModule {}

// Custom file interceptor with S3
// s3-file.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { S3Service } from './s3.service';

@Injectable()
export class S3FileInterceptor implements NestInterceptor {
  constructor(private s3Service: S3Service) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(async (data) => {
        if (data.file) {
          const key = await this.s3Service.uploadFile(data.file);
          const url = await this.s3Service.getFileUrl(key);
          return { ...data, fileUrl: url, fileKey: key };
        }
        return data;
      }),
    );
  }
}
```
