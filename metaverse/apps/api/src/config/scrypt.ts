import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";

const keyLength = 32;
/**
 * Has a password or a secret with a password hashing algorithm (scrypt)
 * @param {string} password
 * @returns {string} The salt+hash
 */
export const hash = async (password:string) => {
    return new Promise((resolve, reject) => {
        // generate random 16 bytes long salt - recommended by NodeJS Docs
        const salt = randomBytes(16).toString("hex");

        scrypt(password, salt, keyLength, (err, derivedKey) => {
            if (err) reject(err);
            // derivedKey is of type Buffer
            resolve(`${salt}.${derivedKey.toString("hex")}`);
        });
    });
};

/**
 * Compare a plain text password with a salt+hash password
 * @param {string} password The plain text password
 * @param {string} hash The hash+salt to check against
 * @returns {boolean}
 */
export const compare = async (password :string, hash:string) => {
    return new Promise((resolve, reject) => {
        const [salt, hashKey] = hash.split(".");
        if (!salt || !hashKey) {
          reject(new Error("Malformed hash"));
          return;
      }
        // we need to pass buffer values to timingSafeEqual
        const hashKeyBuff = Buffer.from(hashKey, "hex");
        scrypt(password, salt, keyLength, (err, derivedKey) => {
            if (err) reject(err);
            // compare the new supplied password with the hashed password using timeSafeEqual
            resolve(timingSafeEqual(hashKeyBuff, derivedKey));
        });
    });
};