import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";


export default abstract class Security {

    public static async generateJWT( payload:{}, seed: string, expiresIn?: number ): Promise<string> {

        if(!expiresIn) {
            return jwt.sign( payload, seed );
        } else {
            return jwt.sign( payload, seed, { expiresIn } );
        }
    }


    public static async validateJWT(token: string, seed: string): Promise<string | object> {
        return jwt.verify(token, seed);
    }

    public static async generateHash(text: string, rounds: number = 10): Promise<string> {
        const salt = await bcrypt.genSalt(rounds);
        return bcrypt.hash(text, salt);
    }


    public static async validateHash(text: string, hashedText: string): Promise<boolean> {
        return bcrypt.compare(text, hashedText);
    }



}
