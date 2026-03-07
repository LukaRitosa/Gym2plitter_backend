import express from 'express';
import { connectToDatabase } from '../db.js';
import { idKorisnika } from '../middleware/middleware.js';
import { obrokValidacija, sviObroci } from '../middleware/obrok_middleware.js';
import { svaHrana } from '../middleware/hrana_middleware.js';
import { ObjectId } from 'mongodb';



const router = express.Router();

let db = await connectToDatabase();




router.get('/', async (req, res)=>{
    const obrok_collection= db.collection('obroci')
    const obroci= await obrok_collection.find().toArray()
    
    return res.status(200).json(obroci)
})

router.get('/biranje', [idKorisnika, sviObroci], async (req, res)=>{
    const svi_obroci= req.svi_obroci

    return res.status(200).json(svi_obroci)
})

router.post('/', [obrokValidacija], async (req, res)=>{
    const novi_obrok= req.body

    const hrana_collection= db.collection('hrana')

    let rez={}

    try{
        for(const s of novi_obrok.sastojci){
            let hrana= await hrana_collection.findOne({_id: new ObjectId(s.id)})

            if(!hrana){
                return res.status(404).json({greska: 'Sastojak u obroku ne postoji'})
            }

            s.naziv= hrana.naziv

            novi_obrok.kalorije+= (hrana.kalorije * s.grami) / 100

            novi_obrok.proteini+= (hrana.proteini * s.grami) / 100

            novi_obrok.grami+= s.grami
        }

        rez= await obrok_collection.insertOne(novi_obrok)

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
})

router.post('/custom', [idKorisnika, obrokValidacija, svaHrana], async (req, res)=>{
    const novi_obrok= req.body

    const id_korisnik= req.user._id

    const sva_hrana= req.sva_hrana

    const obrok_collection= db.collection('customObroci')

    let rez={}

    try{
        const postoji= await obrok_collection.findOne({naziv: novi_obrok.naziv, id_korisnik: id_korisnik})

        if(postoji){
            return res.status(400).json({greska: 'Već ste stvorili ovakav obrok'})
        }

        for(const s of novi_obrok.sastojci){
            let hrana= sva_hrana.find(h => h._id.toString()=== s.id)

            if(!hrana){
                return res.status(404).json({greska: 'Sastojak u obroku ne postoji'})
            }

            s.naziv= hrana.naziv

            novi_obrok.kalorije+= (hrana.kalorije * s.grami) / 100

            novi_obrok.proteini+= (hrana.proteini * s.grami) / 100

            novi_obrok.grami+= s.grami
        }
        
        rez= await obrok_collection.insertOne({...novi_obrok, id_korisnik: id_korisnik})

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
})


export default router