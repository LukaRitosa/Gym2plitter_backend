import { connectToDatabase } from "../db.js"
import { ObjectId } from 'mongodb'

let db= await connectToDatabase()


export const nadiDanPrehrane= async (req, res, next)=>{
    const id_korisnik= req.user._id

    const datum= req.params.datum

    const user_collection= db.collection('users')

    const korisnik= await user_collection.findOne({_id: new ObjectId(id_korisnik)})

    const dan_prehrane= korisnik.prehrana.find(p=>p.datum===datum)

    if(!dan_prehrane){
        return res.status(404).json({greska: 'Ne postoji taj datum'})
    }

    req.dan_prehrane= dan_prehrane
    
    return next()
}