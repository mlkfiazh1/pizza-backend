import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class MediaService {
  private readonly allowedTypes = ['png', 'jpg', 'jpeg', 'mpeg', 'webp'];

  constructor() {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      if (!file) throw new BadRequestException('please select a File');

      const { originalname, mimetype, size, buffer } = file;

      //   check extention, if not allowed throw error
      const status = this.checkExtension(originalname, mimetype);
      if (!status) throw new BadRequestException('file type not allowed');

      //   check allowed size, throw exception if file size exceeds
      const allowedFileSize = parseInt(process.env.ALLOWED_FILE_SIZE as string);
      if (size > allowedFileSize) {
        throw new BadRequestException('file size exceed');
      }

      const randomString = Math.random().toString(36).substring(2, 10);
      let fileName = `${originalname?.split('.')?.at(0)}-${randomString}.${originalname?.split('.')?.at(-1)}`;

      // Write the buffer to a file
      await fs.promises.writeFile(
        `${process.env.MEDIA_FOLDER_PATH}/${fileName}`,
        buffer,
      );

      return `${fileName}`;
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(mediaFilesPath: string) {
    try {
      await fs.promises.unlink(
        `${process.env.MEDIA_FOLDER_PATH}/${mediaFilesPath}`,
      );
    } catch (err) {
      console.error(`Error deleting file at ${mediaFilesPath}:`, err);
      throw err;
    }
  }

  //   check file extension
  private checkExtension(filename: string, mimetype: string) {
    const splitName = filename.split('.');
    if (splitName.length > 1) {
      const type = mimetype.split('/').pop();
      return this.allowedTypes.includes(type as string);
    }

    return false;
  }
}
