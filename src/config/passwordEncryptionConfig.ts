import bcrypt from 'bcrypt';

interface PasswordEncrypter {
    encrypt(textString:string):string | Promise<string>;
}

class BcryptPasswordEncrypter implements PasswordEncrypter {
    private saltRounds: number = 10;

    async encrypt(textString: string): Promise<string> {
        const salt = await bcrypt.genSalt(this.saltRounds);
        return await bcrypt.hash(textString, salt);
    }

    setSaltRounds(saltRounds:number):void {
        this.saltRounds = saltRounds;
    }
}

export const bcryptEncrypter = new BcryptPasswordEncrypter();