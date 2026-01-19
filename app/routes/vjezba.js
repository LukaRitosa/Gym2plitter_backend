import express from 'express'
import { users, user_splits, splits, vjezbe, custom_vjezbe } from '../data/data.js'
import { connectToDatabase } from '../db.js';



const router = express.Router();

let db = await connectToDatabase();



router.get('/', async (req, res)=>{
    let vjezbe_collection= db.collection('vjezbe')
    let sve_vjezbe= await vjezbe_collection.find().toArray()
    res.status(200).json(sve_vjezbe)
})


router.post('/', async (req, res)=>{
    const nova_vjezba= req.body

    const dozvoljeni_kljucevi=['Opis', 'glavni_misic', 'naziv', 'ostali_misici', 'slika']

    const kljucevi= Object.keys(nova_vjezba)

    const krivi_klucevi= kljucevi.some(k=> !dozvoljeni_kljucevi.includes(k))

    if(krivi_klucevi){
        return res.status(400).json({greska: 'Krivi oblik vježbe'})
    }

    const svi_misici=[
        'Prsa',  'Trapez (gornji dio leđa)', 'Lat (najširi mišić leđa)', 
        'Biceps', 'Triceps', 'Podlaktice', 'Ramena-Bočni dio', 'Ramena-Prednji dio', 'Ramena-Stražnji dio',
        'Quadriceps (Prednja loža)', 'Hamstring (Stražnja loža)',  'List', 'Gluteus (stražnjica)', 'Trbuh'
    ]

    const krivi_misic= !svi_misici.includes(nova_vjezba.glavni_misic)


    const krivi_misici=nova_vjezba.ostali_misici.some(m=> !svi_misici.includes(m))

    if(krivi_misici || krivi_misic){
        return res.status(400).json({greska: 'Mišići vježbe nisu dozvoljeni'})
    }

    const vjezbe_collection= db.collection('vjezbe')

    let rez={}

    try{
        const postoji= await vjezbe_collection.findOne({naziv: nova_vjezba.naziv})

        if(postoji){
            return res.status(400).json({greska: 'VJezbu koju pokušavate stvoriti već postoji'})
        }

        rez= await vjezbe_collection.insertOne(nova_vjezba)

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.log(error.errorResponse)
        return res.status(400).json({error: error.errorResponse})
    }
})


export default router