import dotenv from 'dotenv';
dotenv.config();
import { useExpressServer } from 'routing-controllers';
import express from 'express';
import { AppDataSource } from './data-source';
import { UserController } from './controllers/UserController';
import cors from 'cors';
import path from 'path';
import { BlogCommentController } from './controllers/BlogCommentController';
import { PostController } from './controllers/PostController';
import { authorizationChecker } from './auth/authChecker';
import { currentUserChecker } from './auth/currentUserChecker';

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


    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error(`Error encountered: ${err.message}`);

        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        } else {
            next(err); 
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