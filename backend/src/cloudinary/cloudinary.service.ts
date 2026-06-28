import { Inject, Injectable } from "@nestjs/common";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject("CLOUDINARY")
    private readonly cloudinaryClient: typeof cloudinary
  ) {}

  async uploadImage(file: Express.Multer.File, folder = "task-lip"): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinaryClient.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Erro ao enviar imagem para o Cloudinary"));

          resolve(result);
        }
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
