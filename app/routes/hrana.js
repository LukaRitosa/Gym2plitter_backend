import express from 'express';
import { connectToDatabase } from '../db.js';
import { hranaValidacija, svaHrana } from '../middleware/hrana_middleware.js';
import { idKorisnika } from '../middleware/middleware.js';



const router = express.Router();

let db = await connectToDatabase();




router.get('/', async (req, res)=>{
    let hrana_collection= db.collection('hrana')
    let hrana= await hrana_collection.find().toArray()
    res.status(200).json(hrana)
})

router.get('/biranje', [idKorisnika, svaHrana], async (req, res)=>{
    const sva_hrana= req.sva_hrana

    return res.status(200).json(sva_hrana)
})

router.post('/', [hranaValidacija], async (req, res)=>{
    const nova_hrana= req.body

    const hrana_collection= db.collection('hrana')

    let rez={}

    try{
        let postoji= await hrana_collection.findOne({naziv: nova_hrana.naziv})

        if(postoji){
            return res.status(400).json({greska: 'Hrana koju pokušavate stvoriti već postoji'})
        }

        rez= await hrana_collection.insertOne({...nova_hrana, grami: 100})

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.log(error.errorResponse)
        return res.status(400).json({error: error.errorResponse})
    }
})

router.post('/custom', [ idKorisnika, hranaValidacija], async (req, res)=>{
    const nova_hrana= req.body

    const id_korisnik= req.user._id

    const hrana_collection= db.collection('customHrana')

    let rez={}

    try{
        const postoji= await hrana_collection.findOne({naziv: nova_hrana.naziv, id_korisnik: id_korisnik})

        if(postoji){
            return res.status(400).json({greska: 'Obrok koji pokušavate stvoriti već postoji'})
        }
        
        rez= await hrana_collection.insertOne({...nova_hrana, id_korisnik: id_korisnik, grami: 100})

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.log(error.errorResponse)
        return res.status(400).json({error: error.errorResponse})
    }
})

export default router