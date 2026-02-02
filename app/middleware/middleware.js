import { connectToDatabase } from "../db.js";
import { verifyJWT } from "../auth.js"

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

    req.user = decoded
    next()
}


export const validirajSplit= async (req, res, next)=>{
    const split= req.body

    const dozvoljeni_kljucevi=['naziv', 'broj_dana', 'opis', 'dani', 'kalendar']

    const split_kljucevi=Object.keys(split)

    const krivi_kljucevi=split_kljucevi.some(s=> !dozvoljeni_kljucevi.includes(s))

    if(krivi_kljucevi){
        return res.status(400).json({greska: 'krivi oblik splita'})
    }

    const dozvoljeni_kljucevi_dan=['dan', 'naziv', 'vjezbe']

    
    for (const dan of split.dani) {
        const kljucevi = Object.keys(dan)
        const krivi = kljucevi.some(k => !dozvoljeni_kljucevi_dan.includes(k))

        if (krivi) {
            return res.status(400).json({greska: 'krivi oblik dana u splitu'})
        }

        if (!Array.isArray(dan.vjezbe)) {
            return res.status(400).json({greska: 'vjezbe moraju biti array'})
        }
    }


    const dozvoljeni_kljucevi_vjezbe=['id', 'broj_setova']

    for (const dan of split.dani) {
        for (const vjezba of dan.vjezbe) {
            const kljucevi = Object.keys(vjezba);
            const krivi = kljucevi.some(k => !dozvoljeni_kljucevi_vjezbe.includes(k));

            if (krivi) {
                return res.status(400).json({
                    greska: 'krivi oblik vjezbe u splitu'
                });
            }
        }
    }

    const dozvoljeni_kljucevi_kalendar=['naziv', 'split_dan_id']

    
    if(typeof split.kalendar !== 'object' || Array.isArray(split.kalendar)) {
        return res.status(400).json({greska: 'kalendar mora biti objekt'})
    }

    for (const [datum, vrijednost] of Object.entries(split.kalendar)) {
        if(typeof vrijednost !== 'object' || Array.isArray(vrijednost)){
            return res.status(400).json({greska: 'krivi oblik kalendara u splitu'})
        }

        const kljucevi = Object.keys(vrijednost);
        const krivi = kljucevi.some(k => !dozvoljeni_kljucevi_kalendar.includes(k))

        if(krivi){
            return res.status(400).json({greska: 'krivi oblik kalendara u splitu'})
        }
    }

    if(Object.keys(split.kalendar).length!==14){
        return res.status(400).json({greska: 'Kalendar mora sadržavati 14 dana'})
    }

    return next()
}

export const sviSplitovi= async(req, res, next)=>{
    let svi_splitovi=[]

    const split_collection= db.collection('splits')

    const custom_splits_collection= db.collection('customSplits')

    if(!req.user){
        return res.status(401).json({greska: 'Nemate autorizaciju za pregled splitova'})
    }

    const korisnik_id=req.user._id

    const custom_splitovi= await custom_splits_collection.find({id_korisnik: korisnik_id}).toArray()

    const split_kolekcija= await split_collection.find().toArray()

    svi_splitovi= [...custom_splitovi, ...split_kolekcija]

    req.svi_splitovi= svi_splitovi

    next()
}