# Question 16: How do you handle file uploads and downloads in NestJS?

## Answer

NestJS uses `multer` (via `@nestjs/platform-express`) for file uploads. You can use the `@UseInterceptors()` decorator with `FileInterceptor` or `FilesInterceptor`.

## Example:

```typescript
// Install: npm install @nestjs/platform-express multer
// Install types: npm install -D @types/multer

// users.controller.ts
import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
  Param,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  // Single file upload
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  // Multiple files upload
  @Post('photos')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadPhotos(@UploadedFiles() files: Array<Express.Multer.File>) {
    return files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    }));
  }

  // File download
  @Get('avatar/:filename')
  downloadAvatar(@Param('filename') filename: string, @Res() res: Response) {
    res.download(`./uploads/${filename}`);
  }

  // Serve file
  @Get('avatar/:filename')
  serveAvatar(@Param('filename') filename: string, @Res() res: Response) {
    res.sendFile(filename, { root: './uploads' });
  }
}

// Custom file interceptor
// file-upload.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // File validation logic
    return next.handle();
  }
}
```
