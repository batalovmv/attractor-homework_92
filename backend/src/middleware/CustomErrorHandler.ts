import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';

@Middleware({ type: 'after' })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: any, request: any, response: any, next: (err?: any) => any) {
        // обработка ошибок
        if (response.headersSent) {
            return next(error);
        }
        if (!response.headersSent) {
            response.status(error.httpCode || 500);
            response.json({
                name: error.name,
                message: error.message,
            });
        } else {
            next(error);
        }
    }
}