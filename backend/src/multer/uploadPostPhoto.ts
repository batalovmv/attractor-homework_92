import { ExpressMiddlewareInterface } from 'routing-controllers';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';

const uploadsDir = path.resolve(__dirname, '../uploads/post_photos');
const storage = multer.memoryStorage(); 

const upload = multer({ storage: storage });
function generateSafeFilename(originalName:string) {
    const extension = path.extname(originalName);
    const basename = Date.now().toString();
    const safeBasename = basename.slice(0, 255 - extension.length);
    return safeBasename + extension;
}

export class MulterUpload implements ExpressMiddlewareInterface {
    public use(request: any, response: any, next: (err?: any) => any): any {
        upload.single('image')(request, response, (err: any) => {
            if (err) {
                return next(err);
            }

            // Проверяем, был ли файл загружен
            if (!request.file) {
                return next();
            }

            // Генерируем безопасное имя файла
            const filename = generateSafeFilename(request.file.originalname);

            // Путь сохранения файла
            const savePath = path.join(uploadsDir, filename);

            // Использование sharp для изменения размера и сжатия изображения
            sharp(request.file.buffer)
                .resize(200)
                .jpeg({ quality: 30 })
                .toFile(savePath, (err: any) => {
                    if (err) {
                        return next(err);
                    }

                    request.file.filename = filename;
                    request.file.path = savePath;

                    next();
                });
        });
    }
}