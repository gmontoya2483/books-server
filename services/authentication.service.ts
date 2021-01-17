import {IAuthenticateUser, IServiceResponse} from "../interfaces/auth.interfaces";
import {User} from "../models/user.model";
import Security from "../classes/security.class";


export abstract class AuthService {


    public static async authenticateUser({email, password }: IAuthenticateUser): Promise<IServiceResponse>{

        let user : any= await User.findOne({email, 'isDeleted.value': false});
        if (!user) return this.notFoundAuthenticationMessage();

        const validPassword = await Security.validateHash(password, user.password);
        if (!validPassword) return this.notFoundAuthenticationMessage();

        const token: any = await user.generateAuthToken();

        return {
            status: 200,
            response: {
                ok: true,
                token
            }
        }
    }


    private static notFoundAuthenticationMessage(): IServiceResponse {
        return {
            status: 400,
            response: {
                ok: false,
                mensaje: "Email o Password inválidos."
            }
        };
    }

}
