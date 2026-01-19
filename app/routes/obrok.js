import express from 'express';
import { connectToDatabase } from '../db.js';



const router = express.Router();

let db = await connectToDatabase();




router.get('/', async (req, res)=>{
    const obrok_collection= db.collection('obroci')
    const svi_obroci= await obrok_collection.find().toArray()
    res.status(200).json(svi_obroci)
})

router.post('/', async (req, res)=>{
    const novi_obrok= req.body

    const dozvoljeni_kljucevi=['naziv', 'opis', 'kalorije', 'proteini', 'grami', 'sastojci']

    const obrok_kljucevi= Object.keys(novi_obrok)

    const krivi_kljucevi= obrok_kljucevi.some(o => !dozvoljeni_kljucevi.includes(o))

    if(krivi_kljucevi){
        return res.status(400).json({greska: 'Krivi oblik obroka'})
    }

    const obrok_collection= db.collection('obroci')

    let rez={}

    try{
        const postoji= await obrok_collection.findOne({naziv: novi_obrok.naziv})

        if(postoji){
            return res.status(400).json({greska: 'Obrok koji pokušavate stvoriti već postoji'})
        }

        rez= await obrok_collection.insertOne(novi_obrok)

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.log(error.errorResponse)
        return res.status(400).json({error: error.errorResponse})
    }
})

export default router