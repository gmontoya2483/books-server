import {NOT_BASE_URL} from "../globals/environment.global";
import {ISendGridMessage} from "./sendgrid.class";

export abstract class Notification {

    public static getValidationEmail( nombre: string, email: string, token: string ): ISendGridMessage{

        const to = email;
        const subject = `Confirmar tu correo electrónico`;

        const html= `<!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="utf-8"><title>Activar cuenta</title>
            </head>
            <body>
                <h2>Confirma tu correo electronico</h2>
                <br>
                <p>Hola ${nombre},</p>
                 <p>Gracias por registrarte en la Red Social para compartir libros dentro de tu comunidad.
                 Para poder acceder a tu cuenta primero debes validar tu dirección de correo electrónico.</p>
                 <br>
                 <br>
                 <h3>Haz click en el siguiente enlace:</h3>
                 <br>
                 <a href=${NOT_BASE_URL}/auth/verificarEmail?token=${token}><h2>Activar cuenta</h2></a>
                 <br>
                 <p>Muchas gracias!!</p>
            </body>
            </html>`;

        return this.generateNotification(to, subject, html);
    }


    public static getChangePasswordEmail( nombre: string, email: string, token: string ): ISendGridMessage{

        const to = email;
        const subject = `Confirmar solicitud cambio de contraseña`;

        const html= `<!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="utf-8"><title>Cambio de contraseña</title>
            </head>
            <body>
                <h2>Confirma la solicitud de cambio de contraseña</h2>
                <br>
                <p>Hola ${nombre},</p>
                 <p>Hemos recibido una solicitud de cambio de contraseña.</p>
                 <br>
                 <br>
                 <h3>Haz click en el siguiente enlace para continuar con la solicitud:</h3>
                 <br>
                 <a href=${NOT_BASE_URL}/auth/confirmarCambioPassword?token=${token}><h2>Cambiar contraseña</h2></a>
                 <br>
                 <p>Muchas gracias!!</p>
            </body>
            </html>`;

        return this.generateNotification(to, subject, html);
    }

    public static getRequestCopyLoan ( requesterName: string, requesterEmail: string, ownerName: string, ownerEmail: string, title: string ): ISendGridMessage{

        const to = ownerEmail;
        const subject = `Solicitud de préstamo: ${ title }`;

        const html= `<!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="utf-8"><title>Solicitud de Préstamo: ${ title }</title>
            </head>
            <body>
                <h2>Solicitud de Préstamo: ${ title }</h2>
                <br>
                <p>Hola ${ownerName},</p>
                 <p>El usuario ${ requesterName }, cuyo correo electrónico es ${ requesterEmail }, te solicito prestado el ejemplar del libro <strong>${ title }</strong>.</p>
                 <p>Por favor ingrese a su biblioteca para aceptar o rechazar el pedido.</p>
                 <br>
                 <p>Muchas gracias!!</p>
            </body>
            </html>`;

        return this.generateNotification(to, subject, html);
    }

    public static getAcceptCopyLoan ( requesterName: string, requesterEmail: string, ownerName: string, ownerEmail: string, title: string ): ISendGridMessage{

        const to = requesterEmail;
        const subject = `Solicitud de préstamo aceptada: ${ title }`;

        const html= `<!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="utf-8"><title>Solicitud de Préstamo: ${ title }</title>
            </head>
            <body>
                <h2>Solicitud de Préstamo: ${ title }</h2>
                <br>
                <p>Hola ${requesterName},</p>
                 <p>El usuario ${ ownerName }, con el email ${ ownerEmail }, aceptó prestarte el ejemplar del libro <strong>${ title }</strong>.</p>
                 <p>Coordiná con el dueño del ejemplar como retirarlo.</p>
                 <br>
                 <p>Muchas gracias!!</p>
            </body>
            </html>`;

        return this.generateNotification(to, subject, html);

    }


    public static getRejectCopyLoan ( requesterName: string, requesterEmail: string, ownerName: string, ownerEmail: string, title: string ): ISendGridMessage{

        const to = requesterEmail;
        const subject = `Solicitud de préstamo rechazada: ${ title }`;

        const html= `<!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="utf-8"><title>Solicitud de Préstamo: ${ title }</title>
            </head>
            <body>
                <h2>Solicitud de Préstamo: ${ title }</h2>
                <br>
                <p>Hola ${requesterName},</p>
                 <p>El usuario ${ ownerName }, por el momento, no aceptó prestarte el ejemplar del libro <strong>${ title }</strong>.</p>
                 <p>Si aún estás interesado en leer este libro, busca otra copia entre tus amigos o vuelve a pedirselo prestado a ${ ownerName } en otro momento.</p>
                 <br>
                 <p>Muchas gracias!!</p>
            </body>
            </html>`;

        return this.generateNotification(to, subject, html);

    }

    public static getBorrowCopyLoan ( requesterName: string, requesterEmail: string, ownerName: string, ownerEmail: string, title: string ): ISendGridMessage{

        const to = requesterEmail;
        const subject = `Libro prestado: ${ title }`;

        const html= `<!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="utf-8"><title>Libro prestado: ${ title }</title>
            </head>
            <body>
                <h2>Libro prestado: ${ title }</h2>
                <br>
                <p>Hola ${requesterName},</p>
                 <p>El usuario ${ ownerName } informó que te ha dado en prestamo el libro <strong>${ title }</strong>.</p>
                 <br>
                 <p>Muchas gracias!!</p>
            </body>
            </html>`;

        return this.generateNotification(to, subject, html);

    }

    public static getClaimCopyLoan ( requesterName: string, requesterEmail: string, ownerName: string, ownerEmail: string, title: string ): ISendGridMessage{

        const to = requesterEmail;
        const subject = `Solicitud de devolución: ${ title }`;

        const html= `<!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="utf-8"><title>Solicitud de devolución: ${ title }</title>
            </head>
            <body>
                <h2>Solicitud de devolución: ${ title }</h2>
                <br>
                <p>Hola ${requesterName},</p>
                 <p>El usuario ${ ownerName }, con el email ${ ownerEmail }, solicitó que le devuelvas el libro <strong>${ title }</strong>.</p>
                 <p>Coordiná con el dueño del ejemplar la devulución del mismo.</p>
                 <p>Si aún no finalizaste de leer este libro, busca otra copia entre tus amigos o vuelve a pedirselo prestado a ${ ownerName } en otro momento.</p>
                 <br>
                 <p>Muchas gracias!!</p>
            </body>
            </html>`;

        return this.generateNotification(to, subject, html);

    }


    public static getReturnedConfirmationCopyLoan ( requesterName: string, requesterEmail: string, ownerName: string, ownerEmail: string, title: string ): ISendGridMessage{

        const to = requesterEmail;
        const subject = `Confirmación devolución: ${ title }`;

        const html= `<!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="utf-8"><title>Confirmación devolución: ${ title }</title>
            </head>
            <body>
                <h2>Confirmación devolución: ${ title }</h2>
                <br>
                <p>Hola ${requesterName},</p>
                 <p>El usuario ${ ownerName } ha confirmado que le has devuelto el ejemplar del libro <strong>${ title }</strong>.</p>
                 <p>Puedes ver la confirmación de la devolución en la sección <strong>libros que me prestaron</strong>.</p>
                 <br>
                 <p>Muchas gracias!!</p>
            </body>
            </html>`;

        return this.generateNotification(to, subject, html);

    }






    private static generateNotification (  to: string, subject: string, html: string): ISendGridMessage{
        // @ts-ignore
        return { to, subject, html: html.replace(/['"]+/g, "") };
    }




}
