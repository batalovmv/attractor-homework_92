import dotenv from 'dotenv';
dotenv.config();
import { HttpError, useExpressServer } from 'routing-controllers';
import express from 'express';
import { AppDataSource } from './data-source';
import { UserController } from './controllers/UserController';
import cors from 'cors';
import path from 'path';
import { BlogCommentController } from './controllers/BlogCommentController';
import { PostController } from './controllers/PostController';
import { authorizationChecker } from './auth/authChecker';
import { currentUserChecker } from './auth/currentUserChecker';
import { CustomErrorHandler } from './middleware/CustomErrorHandler';

const app = express();
app.use(cors())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());


app.use((err,req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
    if (res.headersSent) {
        // Если заголовки уже отправлены, делегируем Express обработку ошибки
        return next(err);
    }
  next();
});

AppDataSource.initialize().then(async () => {
    useExpressServer(app, {
        classTransformer: true,
        validation: true,
        controllers: [BlogCommentController, PostController, UserController],
        middlewares: [CustomErrorHandler],
        authorizationChecker: authorizationChecker,
        currentUserChecker: currentUserChecker,
    });


    app.use((err:any, req:any, res:any, next:any) => {
        if (res.headersSent) {
            // Если заголовки уже отправлены, делегируем Express обработку ошибки
            return next(err);
        }
        if (err instanceof HttpError) {
            return res.status(err.httpCode).json({
                error: err.message
            });
        } else {
            console.error(err); // логируем ошибку для дебага
            return res.status(500).json({
                error: 'Внутренняя ошибка сервера'
            });
        }
    });

    app.all('*', (req, res) => {
        // Исправление: Проверка на headersSent не нужна, так как это последний обработчик
        res.status(404).json({ message: 'Route Not Found' });
    });

    const PORT = process.env.PORT || 3006;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error("Error during Data Source initialization:", error);
});