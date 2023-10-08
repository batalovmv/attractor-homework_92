import { ExpressMiddlewareInterface } from 'routing-controllers';
import multer from 'multer';
const path = require('path');
const uploadsDir = path.resolve(__dirname, '../uploads/post_photos');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now().toString() + '-' + file.originalname)
  }
}); 

const upload = multer({ storage: storage });

export class MulterUpload implements ExpressMiddlewareInterface {
  public use(request: any, response: any, next: (err?: any) => any): any {
    upload.single('image')(request, response, (err: any) => {
      if (err) {
        return response.sendStatus(500);
      }
      next();
    });
  }
}