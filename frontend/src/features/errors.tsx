export type ApiResponseError = {
    name: string;
    message: string;
    stack: string;
};
export default function parseError(responseError: any): ApiResponseError {
    if (responseError && responseError.data && responseError.data.name) {
        return {
            name: responseError.data.name,
            message: responseError.data.message || 'An error occurred',
            stack: responseError.data.stack,
        };
    } else {
        return {
            name: 'UnknownError',
            message: 'An unknown error occurred',
            stack: '',
        };
    }
}