import {IAuthenticateUser, IServiceResponse} from "../interfaces/auth.interfaces";
import {User} from "../models/user.model";
import Security from "../classes/security.class";


export abstract class AuthService {


    public static async authenticateUser({email, password }: IAuthenticateUser): Promise<IServiceResponse>{

        let user : any= await User.findOne({email});
        if (!user) return this.notFoundGenreMessage();

        const validPassword = await Security.validateHash(password, user.password);
        if (!validPassword) return this.notFoundGenreMessage();

        const token: any = await user.generateAuthToken();

        return {
            status: 200,
            response: {
                ok: true,
                token
            }
        }
    }


    private static notFoundGenreMessage(): IServiceResponse {
        return {
            status: 400,
            response: {
                ok: false,
                mensaje: "Email o Password inválidos."
            }
        };
    }

}
