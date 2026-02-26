import { connectToDatabase } from "../db.js";
import { verifyJWT } from "../auth.js"
import { ObjectId } from 'mongodb'

let db= await connectToDatabase()


export const hranaValidacija= async(req, res, next)=>{
    const nova_hrana= req.body

    const dozvoljeni_kljucevi=['kalorije', 'naziv', 'proteini']

    const hrana_kljucevi= Object.keys(nova_hrana)

    const krivi_kljucevi= hrana_kljucevi.some(h => !dozvoljeni_kljucevi.includes(h))

    if(krivi_kljucevi){
        return res.status(400).json({greska: 'krivi oblik hrane'})
    }

    return next()
}


export const svaHrana= async(req, res, next)=>{
    let sva_hrana=[]

    const hrana_collection= db.collection('hrana')

    const custom_hrana_collection= db.collection('customHrana')

    if(!req.user){
        return res.status(401).json({greska: 'Nemate autorizaciju za pregled splitova'})
    }

    const korisnik_id=req.user._id

    const custom_hrana= await custom_hrana_collection.find({id_korisnik: korisnik_id}).toArray()

    const hrana_kolekcija= await hrana_collection.find().toArray()

    sva_hrana= [...custom_hrana, ...hrana_kolekcija]

    req.sva_hrana= sva_hrana

    next()
}