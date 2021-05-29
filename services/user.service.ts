import {User} from "../models/user.model";
import _ from "lodash";
import Security from "../classes/security.class";
import {Notification} from "../classes/notification.class";
import logger from "../startup/logger.startup";
import {SendGrid} from "../classes/sendgrid.class";
import {
    IAdminUser,
    IChangePassword,
    IChangePasswordRequest, IDeleteUser,
    INewUser,
    IServiceResponse,
    IValidateEmail, IValidateUser
} from "../interfaces/user.interfaces";


export abstract class UserService {

    private static stdOutputFields: string [] = [
        '_id',
        'email',
        'isValidated',
        'isAdmin',
        'nombre',
        'apellido'
    ];

    public static async newUser({nombre, apellido, email, password}: INewUser): Promise<IServiceResponse> {

        nombre = nombre.trim().toUpperCase();
        apellido = apellido.trim().toUpperCase();

        // Validar email no esta duplicado
        if (await this.existsUser({email})) {
            return {
                status: 400,
                response: {
                    ok: false,
                    mensaje: `email '${email}' ya se encuentra registrado`
                }

            }
        }


        // Crear usuario
        const user: any = new User({email, nombre, apellido, password});
        user.password = await Security.generateHash(user.password);

        // Crear notificación
        const token: any = await user.generateNotificationToken();
        if (!await this.sendEmailValidationEmail(user.nombre, user.email, token)){
            return {
                status: 500,
                response: {
                    ok: false,
                    mensaje: `No se pudo enviar el correo electrónico para validar el email`
                }

            }

        }

        // Guardar usuario
        logger.debug(`Guardar usuario en Base de Datos: ${JSON.stringify(user)}`);
        await user.save();


        return {
            status: 201,
            response: {
                ok: true,
                mensaje: `Usuario ${user.email} ha sido creado. Debe validar su dirección de correo electrónico`,
                usuario: _.pick(user, this.stdOutputFields)

            }
        }
    }


    public static async validateEmail({_id}: IValidateEmail): Promise<IServiceResponse> {

        const user: any = await User.findByIdAndUpdate(_id, {
            $set: {
                isValidated: {
                    value: true,
                    validatedDateTime: Date.now()
                },
                updatedDateTime: Date.now()
            }
        }, {new: true})

        if (!user) return this.notFoundUserMessage();

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `Se ha validado el correo electónico: ${user.email}.`,
                usuario: _.pick(user, this.stdOutputFields)

            }
        }
    }

    public static async changePasswordRequest({email}: IChangePasswordRequest): Promise<IServiceResponse> {
        // Validar email existe
        let user: any = await User.findOne({email});
        if (!user) return this.notFoundUserMessage(`Email '${email}' no se encuentra registrado`);


        // Crear notificación
        const token: any = await user.generateNotificationToken();
        const emailMessage: any = Notification.getChangePasswordEmail(user.nombre, user.email, token);

        // Enviar Notificacion
        logger.debug(`Enviando Nofificacion a SendGrid: ${JSON.stringify(emailMessage)}`);
        const sendGrid = new SendGrid();
        await sendGrid.sendSingleEmail(emailMessage);


        return {
            status: 201,
            response: {
                ok: true,
                mensaje: `Para poder continuar con el cambio de contraseña, se envió un email a ${user.email}`
            }
        }
    }

    public static async changePassword(UserId: string, {password}: IChangePassword): Promise<IServiceResponse> {

        const user: any = await User.findByIdAndUpdate(UserId, {
            $set: {
                password: await Security.generateHash(password),
                updatedDateTime: Date.now()
            }
        }, {new: true})

        if (!user) return this.notFoundUserMessage();


        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `Se ha cambiado la contraseña para el usuario ${user.email}.`,
                usuario:  _.pick(user,this.stdOutputFields)
            }
        };
    }


    public static async setDeleted (UserId: string, {isDeleted}: IDeleteUser): Promise<IServiceResponse>{
        const deleted = (isDeleted) ? {value: true, deletedDateTime: Date.now()}
            : {value: false, deletedDateTime: null};

        const user: any = await User.findByIdAndUpdate(UserId, {
            $set: {
                isDeleted: deleted,
                updatedDateTime: Date.now()
            }
        }, {new: true}).select({'password': 0, '__v': 0});

        if (!user) return this.notFoundUserMessage();

        const message = (isDeleted) ? `El usuario ha sido marcada como eliminado`
            : `El usuario ha sido desmarcado como eliminado`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                usuario: user
            }

        };

    }


    public static async setValidated (UserId: string, {isValidated}: IValidateUser, sendEmail: boolean = false): Promise<IServiceResponse>{
        const validated = (isValidated) ? {value: true, validatedDateTime: Date.now()}
            : {value: false, validatedDateTime: null};


        const user: any = await User.findById(UserId).select({'password': 0, '__v': 0});
        if (!user) return this.notFoundUserMessage();


        // Enviar el email
        if (!isValidated && sendEmail){
            const token: any = await user.generateNotificationToken();
            if (!await this.sendEmailValidationEmail(user.nombre, user.email, token)){
                return {
                    status: 500,
                    response: {
                        ok: false,
                        mensaje: `No se pudo enviar el correo electrónico para validar el email`
                    }

                }
            }
        }

        user.isValidated = validated;
        await user.save();


        let message = (isValidated) ? `El usuario ha sido marcada como validado.`
            : `El usuario ha sido desmarcado como validado.`

        if(!isValidated && sendEmail){
            message = `${message} Se envió al usuario un email para validar el correo electrónico.`
        }


        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                usuario: user
            }

        };

    }

    public static async getSingleUser(UserId: string): Promise<IServiceResponse>{
        const user: any = await User.findById(UserId).select({'password': 0, '__v': 0});
        if (!user) return this.notFoundUserMessage();

        return {
            status: 200,
            response: {
                ok: true,
                usuario: user
            }
        };


    }


    public static async setAdmin (UserId: string, {isAdmin}: IAdminUser): Promise<IServiceResponse>{

        const user: any = await User.findByIdAndUpdate(UserId, {
            $set: {
                isAdmin,
                updatedDateTime: Date.now()
            }
        }, {new: true}).select({'password': 0, '__v': 0});

        if (!user) return this.notFoundUserMessage();

        const message = (isAdmin) ? `El usuario ha sido marcada como administrador`
            : `El usuario ha sido desmarcado como administrador`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                usuario: user
            }

        };

    }


    private static async existsUser (condition: {}){
        let user = await User.findOne(condition);
        return !!user;
    }

    public static async findUser(userId: string): Promise<any> {
        const user: any  = await User.findById(userId).select({password: 0});
        return user;
    }


    public static notFoundUserMessage(mensaje: string = "Usuario no encontrada"): IServiceResponse {
        return {
            status: 404,
            response: {
                ok: false,
                mensaje
            }
        };
    }

    public static badRequestUserMessage(mensaje: string = `Problemas con el ususario`): IServiceResponse {
        return {
            status: 400,
            response: {
                ok: false,
                mensaje
            }
        };
    }


    private static async sendEmailValidationEmail(name: string, email: string, token: string){
            const emailMessage: any = Notification.getValidationEmail(name, email, token);
            return await this.sendEmail(emailMessage);
    }

    private static async sendEmail(emailMessage: any){
        try {
            logger.debug(`Enviando Nofificacion a SendGrid: ${JSON.stringify(emailMessage)}`);
            const sendGrid = new SendGrid();
            await sendGrid.sendSingleEmail(emailMessage);

            return true;

        } catch (e){
            logger.error(`No se pudo enviar el email:`, e);
            return false;
        }
    }

}




