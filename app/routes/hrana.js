import express from 'express';
import { connectToDatabase } from '../db.js';



const router = express.Router();

let db = await connectToDatabase();




router.get('/', async (req, res)=>{
    let hrana_collection= db.collection('hrana')
    let sva_hrana= await hrana_collection.find().toArray()
    res.status(200).json(sva_hrana)
})

router.post('/', async (req, res)=>{
    const nova_hrana= req.body

    const dozvoljeni_kljucevi=['kalorije', 'naziv', 'proteini']

    const hrana_kljucevi= Object.keys(nova_hrana)

    const krivi_kljucevi= hrana_kljucevi.some(h => !dozvoljeni_kljucevi.includes(h))

    if(krivi_kljucevi){
        return res.status(400).json({greska: 'krivi oblik hrane'})
    }

    const hrana_collection= db.collection('hrana')

    let rez={}

    try{
        let postoji= await hrana_collection.findOne({naziv: nova_hrana.naziv})

        if(postoji){
            return res.status(400).json({greska: 'Hrana koju pokušavate stvoriti već postoji'})
        }

        rez= await hrana_collection.insertOne(nova_hrana)

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.log(error.errorResponse)
        return res.status(400).json({error: error.errorResponse})
    }
})

export default router