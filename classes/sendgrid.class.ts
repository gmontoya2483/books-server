import logger from "../startup/logger.startup";
import {SEND_GRID_API_KEY, SEND_GRID_FROM_EMAIL} from "../globals/environment.global";

export interface ISendGridMessage {
        to: string;
        subject: string;
        text?: string;
        html?:string;
}

export class SendGrid {
    sgMail = require('@sendgrid/mail');
    public emailFrom: string;

    constructor() {

        logger.debug(`SendGridApiKey: ${SEND_GRID_API_KEY}`);
        logger.debug(`SendGridFromEmail: ${SEND_GRID_FROM_EMAIL}`);
        this.sgMail.setApiKey(SEND_GRID_API_KEY);
        this.emailFrom = SEND_GRID_FROM_EMAIL;

    }


    public async sendSingleEmail (mensaje: ISendGridMessage){
        const msg = {...mensaje, from: this.emailFrom};

        try {
            await this.sgMail.send(msg);
        }catch (error) {
            logger.error('No se pudo mandar el email', error);
        }
    }




}
