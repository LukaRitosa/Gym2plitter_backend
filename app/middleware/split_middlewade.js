import { connectToDatabase } from "../db.js";
import { verifyJWT } from "../auth.js"
import { ObjectId } from 'mongodb'

let db= await connectToDatabase()

export const validirajSplit= async (req, res, next)=>{
    const split= req.body

    const dozvoljeni_kljucevi=['naziv', 'broj_dana', 'opis', 'dani']

    const split_kljucevi=Object.keys(split)

    const krivi_kljucevi=split_kljucevi.some(s=> !dozvoljeni_kljucevi.includes(s))

    if(krivi_kljucevi){
        return res.status(400).json({greska: 'krivi oblik splita'})
    }

    const nema_obaveznih_kljuceva= dozvoljeni_kljucevi.filter(k => !(k in split))

    if (nema_obaveznih_kljuceva.length > 0) {
        return res.status(400).json({greska: 'Nedostaju obavezna polja'})
    }

    if (typeof split.naziv !== 'string') {
        return res.status(400).json({ greska: 'naziv mora biti string' })
    }

    if (typeof split.opis !== 'string') {
        return res.status(400).json({ greska: 'opis mora biti string' })
    }

    if (typeof split.broj_dana !== 'number') {
        return res.status(400).json({ greska: 'broj_dana mora biti broj' })
    }

    if (!Array.isArray(split.dani)) {
        return res.status(400).json({ greska: 'dani moraju biti array' })
    }

    if (split.dani.length !== split.broj_dana) {
        return res.status(400).json({greska: 'Krivi broj dana'})
    }

    const dozvoljeni_kljucevi_dan=['dan', 'naziv', 'vjezbe']

    
    for (const dan of split.dani) {
        const kljucevi = Object.keys(dan)
        const krivi = kljucevi.some(k => !dozvoljeni_kljucevi_dan.includes(k))

        const fali_dan = dozvoljeni_kljucevi_dan.filter(k => !(k in dan))

        if (krivi) {
            return res.status(400).json({greska: 'krivi oblik dana u splitu'})
        }

        if (fali_dan.length > 0) {
            return res.status(400).json({greska: 'Dan nema obavezna polja'})
        }

        if (typeof dan.dan !== 'number') {
            return res.status(400).json({ greska: 'dan mora biti broj' })
        }

        if (typeof dan.naziv !== 'string') {
            return res.status(400).json({ greska: 'naziv dana mora biti string' })
        }

        if (!Array.isArray(dan.vjezbe)) {
            return res.status(400).json({greska: 'Vježbe moraju biti array'})
        }

        for (const vjezba of dan.vjezbe) {

            if (typeof vjezba !== 'string') {
                return res.status(400).json({greska: 'Vježba mora biti string'})
            }

        }
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

    return next()
}

export const trenutniSplit= async(req, res, next)=>{
    const id_user= req.user._id
    
    const users_collection= db.collection('users')

    const korisnik= await users_collection.findOne({_id: new ObjectId(id_user)})

    const user_splits= db.collection('userSplits')

    const trenutni_split= await user_splits.findOne({_id: new ObjectId(korisnik.trenutniSplit), id_korisnik: id_user})

    if(!trenutni_split){
        return res.status(404).json({greska: 'vaš trenutni split ne postoji'})
    }

    req.trenutni_split= trenutni_split

    return next()
}

export const pronadeniDan= async(req, res, next)=>{
    const dani= req.trenutni_split.dani

    const id_dan= Number(req.params.id_dan)

    const dan= dani.find(d=> d.dan=== id_dan)

    if(!dan){
        return res.status(404).json({greska: 'Dan koji tražite ne postoji u ovom splitu'})
    }

    req.dan= dan

    return next()
}


export const dummyKalendar = async(req, res, next)=>{
    const kalendar = {}

    for (let i = 0; i < 14; i++) {
        const datum = new Date(2004, 7, 6 + i).toISOString().split('T')[0]

        kalendar[datum] = {
            split_dan_id: null,
            naziv: "Odmor"
        }
    }

    req.kalendar= kalendar

    return next()
}

export const pripremiDane= async(req, res, next)=>{
    const split= req.body

    split.dani= split.dani.map(dan=>({
        dan: dan.dan,
        naziv: dan.naziv,
        vjezbe: dan.vjezbe.map(id => ({
            id: id,
            broj_setova: 1
        }))
    }))

    return next()
}