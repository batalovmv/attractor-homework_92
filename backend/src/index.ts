import { useExpressServer } from 'routing-controllers';
import express from 'express';
import { AppDataSource } from './data-source';
import { UserController } from './controllers/UserController';
import cors from 'cors';
import path from 'path';
import { BlogCommentController} from './controllers/BlogCommentController';
import { PostController } from './controllers/PostController';
import { authorizationChecker } from './auth/authChecker';
import { currentUserChecker } from './auth/currentUserChecker';
import { UserRepository } from './repositories/user.repository';
const app = express();
app.use(cors())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());

// Логирование входящих запросов
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});


AppDataSource.initialize().then(async () => {
 


  useExpressServer(app, {
    classTransformer: true,
    validation: true,
    controllers: [BlogCommentController, PostController, UserController],
    authorizationChecker: authorizationChecker,
    currentUserChecker: currentUserChecker,
  });

  app.use(express.json());

  // Обработчик ошибок
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`Error encountered: ${err.message}`);
    next(err);
  });

  app.all('*', (req, res) => {
    res.status(404).json({ message: 'Route Not Found' });
  });

  app.listen(3006);

});
