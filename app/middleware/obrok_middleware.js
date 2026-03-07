import { connectToDatabase } from "../db.js"

let db= await connectToDatabase()


export const obrokValidacija= async(req, res, next)=>{
    const novi_obrok= req.body

    const dozvoljeni_kljucevi=['naziv', 'opis', 'sastojci']

    const obrok_kljucevi= Object.keys(novi_obrok)

    const krivi_kljucevi= obrok_kljucevi.some(o => !dozvoljeni_kljucevi.includes(o))

    if(krivi_kljucevi){
        return res.status(400).json({greska: 'Krivi oblik obroka'})
    }

    if(typeof novi_obrok.naziv !== 'string'){
        return res.status(400).json({greska: 'Naziv mora biti string'})
    }

    if(typeof novi_obrok.opis !== 'string'){
        return res.status(400).json({greska: 'Opis mora biti string'})
    }

    if(!Array.isArray(novi_obrok.sastojci)){
        return res.status(400).json({greska: 'Sastojci moraju biti array'})
    }

    for(const s of novi_obrok.sastojci){

        if(typeof s.id !== 'string'){
            return res.status(400).json({greska: 'Sastojak mora imati id'})
        }

        if(typeof s.grami !== 'number'){
            return res.status(400).json({greska: 'Sastojak mora imati grame'})
        }

    }

    const obrok_collection= db.collection('obroci')

    const postoji= await obrok_collection.findOne({naziv: novi_obrok.naziv})

    if(postoji){
        return res.status(400).json({greska: 'Obrok koji pokušavate stvoriti već postoji'})
    }

    req.body.kalorije= 0
    req.body.proteini= 0
    req.body.grami= 0

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

    return next()
}