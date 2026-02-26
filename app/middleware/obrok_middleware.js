import { connectToDatabase } from "../db.js";
import { verifyJWT } from "../auth.js"
import { ObjectId } from 'mongodb'

let db= await connectToDatabase()


export const obrokValidacija= async(req, res, next)=>{
    const novi_obrok= req.body

    const dozvoljeni_kljucevi=['naziv', 'opis', 'kalorije', 'proteini', 'grami', 'sastojci']

    const obrok_kljucevi= Object.keys(novi_obrok)

    const krivi_kljucevi= obrok_kljucevi.some(o => !dozvoljeni_kljucevi.includes(o))

    if(krivi_kljucevi){
        return res.status(400).json({greska: 'Krivi oblik obroka'})
    }

    return next()
}


export const sviObroci= async(req, res, next)=>{
    let svi_obroci=[]

    const obrok_collection= db.collection('obroci')

    const custom_obrok_collection= db.collection('customObroci')

    if(!req.user){
        return res.status(401).json({greska: 'Nemate autorizaciju za pregled splitova'})
    }

    const korisnik_id=req.user._id

    const custom_obroci= await custom_obrok_collection.find({id_korisnik: korisnik_id}).toArray()

    const obrok_kolekcija= await obrok_collection.find().toArray()

    svi_obroci= [...custom_obroci, ...obrok_kolekcija]

    req.svi_obroci= svi_obroci

    next()
}