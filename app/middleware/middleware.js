import { connectToDatabase } from "../db.js";

let db= await connectToDatabase()

export const nadiKorisnika= async (req, res, next)=>{
    let korisnik= req.body

    let user_collection= db.collection('users')

    let postoji= await user_collection.findOne({email: korisnik.email})

    if(postoji){
        req.user= postoji
        return next()
    }
    return next()
}