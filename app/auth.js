import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export async function hashPassword(plainPassword, saltRounds){
    try{
        let hashirano= await bcrypt.hash(plainPassword, saltRounds)
        return hashirano
    } catch(error){
        console.error(`Desila se greška pri hashiranju lozinke ${error}`)
    }
}

export async function checkPassword(plainPassword, hashPassword){
    try{
        let rez= await bcrypt.compare(plainPassword, hashPassword)
        return rez
    } catch(error){
        console.error(`Došlo je do greške prilikom usporedbe hash vrijednosti: ${error}`);
        return false;
    }
}

export async function generateJWT(payload){
    try{
        let token= jwt.sign(payload, JWT_SECRET)
        return token
    } catch(error){
        console.error(`Došlo je do greške prilikom stvaranje tokena: ${error}`);
        return false;
    }
}