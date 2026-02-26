import express from 'express';
import { connectToDatabase } from '../db.js';
import { idKorisnika } from '../middleware/middleware.js';
import { obrokValidacija, sviObroci } from '../middleware/obrok_middleware.js';



const router = express.Router();

let db = await connectToDatabase();




router.get('/', async (req, res)=>{
    const obrok_collection= db.collection('obroci')
    const obroci= await obrok_collection.find().toArray()
    res.status(200).json(obroci)
})

router.get('/biranje', [idKorisnika, sviObroci], async (req, res)=>{
    const svi_obroci= req.svi_obroci

    return res.status(200).json(svi_obroci)
})

router.post('/', [obrokValidacija], async (req, res)=>{
    const novi_obrok= req.body

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

router.post('/custom', [idKorisnika, obrokValidacija], async (req, res)=>{
    const novi_obrok= req.body

    const id_korisnik= req.user._id

    const obrok_collection= db.collection('customObroci')

    let rez={}

    try{
        const postoji= await obrok_collection.findOne({naziv: novi_obrok.naziv, id_korisnik: id_korisnik})

        if(postoji){
            return res.status(400).json({greska: 'Obrok koji pokušavate stvoriti već postoji'})
        }
        
        rez= await obrok_collection.insertOne({...novi_obrok, id_korisnik: id_korisnik})

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.log(error.errorResponse)
        return res.status(400).json({error: error.errorResponse})
    }
})


export default router