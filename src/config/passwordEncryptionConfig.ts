import bcrypt from 'bcrypt';

interface PasswordEncrypter {
    encrypt(textString:string):string | Promise<string>;
    decrypt(plainText:string, hash:string): boolean | Promise<boolean>;
}

class BcryptPasswordEncrypter implements PasswordEncrypter {
    private saltRounds: number = +process.env.SALT_ROUNDS;

    async encrypt(textString: string): Promise<string> {
        const salt = await bcrypt.genSalt(this.saltRounds);
        return await bcrypt.hash(textString, salt);
    }

    async decrypt(plainText: string, hash: string) {
        return await bcrypt.compare(plainText, hash)
    }

    setSaltRounds(saltRounds:number):void {
        this.saltRounds = saltRounds;
    }
}

export const bcryptEncrypter = new BcryptPasswordEncrypter();