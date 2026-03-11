import { connectToDatabase } from "../db.js";
import { verifyJWT } from "../auth.js"
import { ObjectId } from 'mongodb'

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
 
export const idKorisnika= async (req, res, next)=>{
    const header= req.headers.authorization

    if(!header){
        return res.status(404).json({greska: 'nema jwt-a u headeru'})
    }

    let token= header.split(' ')[1]

    const decoded= await verifyJWT(token)

    if(!decoded) {
        return res.status(401).json({ greska: 'Neispravan token' })
    }

    const user_collection = db.collection('users')

    const user = await user_collection.findOne({_id: new ObjectId(decoded._id)})

    if (!user) {
        return res.status(404).json({ greska: 'Korisnik ne postoji' })
    }

    req.user = decoded
    return next()
}



