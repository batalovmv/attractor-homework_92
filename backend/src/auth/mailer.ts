import nodemailer from 'nodemailer';

// Вам нужно будет настроить эти значения с вашими реальными данными SMTP
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER, // используйте переменные окружения
        pass: process.env.GMAIL_PASS, // используйте переменные окружения
    },
});

export const sendConfirmationEmail = async (userEmail:string, confirmationToken:string) => {
    const mailOptions = {
        from: 'batalov94@gmail.com', // замените на ваш реальный email
        to: userEmail,
        subject: 'Подтверждение регистрации',
        text: `Для подтверждения регистрации перейдите по ссылке: https://${process.env.FRONT_ID}/users/confirm/${confirmationToken}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Письмо с подтверждением отправлено');
    } catch (error) {
        console.error('Ошибка при отправке письма: ', error);
        throw error; // Выбросите исключение, чтобы можно было обработать его выше
    }
};