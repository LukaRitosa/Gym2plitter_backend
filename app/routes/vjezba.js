import express from 'express'
import { connectToDatabase } from '../db.js';
import { idKorisnika } from '../middleware/middleware.js';
import { validirajVjezbu, sveVjezbe } from '../middleware/vjezba_middleware.js';
import { validationResult } from 'express-validator'
import { ObjectId } from 'mongodb';


const router = express.Router();

let db = await connectToDatabase();



router.get('/', async (req, res)=>{
    let vjezbe_collection= db.collection('vjezbe')
    let sve_vjezbe= await vjezbe_collection.find().toArray()

    return res.status(200).json(sve_vjezbe)
})

router.post('/', [validirajVjezbu], async (req, res)=>{

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    
    const vjezbe_collection= db.collection('vjezbe')

    const nova_vjezba= req.body

    let rez={}

    try{
        const postoji= await vjezbe_collection.findOne({naziv: nova_vjezba.naziv})

        if(postoji){
            return res.status(400).json({greska: 'VJezbu koju pokušavate stvoriti već postoji'})
        }

        rez= await vjezbe_collection.insertOne(nova_vjezba)

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
})


router.post('/custom', [validirajVjezbu, idKorisnika], async (req, res)=>{
    const vjezbe_collection= db.collection('customVjezbe')

    const nova_vjezba= req.body

    if(!req.user){
        return res.status(401).json({greska: 'niste autorizirani za stvaranje custom splita'})
    }

    const korisnik_id= req.user._id

    let rez={}

    try{
        rez= await vjezbe_collection.insertOne({...nova_vjezba, id_korisnik: korisnik_id})

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
})

router.get('/biranje', [idKorisnika, sveVjezbe], async (req, res)=>{
    let sve_vjezbe=req.sve_vjezbe

    return res.status(200).json(sve_vjezbe)
}) 

router.get('/:id', [idKorisnika, sveVjezbe], async (req, res)=>{
    let sve_vjezbe=req.sve_vjezbe

    const id_vjezba= req.params.id

    const vjezba= sve_vjezbe.find(v=> v._id.toString()=== id_vjezba)

    if(!vjezba){
        return res.status(404).json({greska: 'Vježba koju trežite ne postoji'})
    }

    return res.status(200).json(vjezba)
}) 


router.delete('/custom/:id', [idKorisnika], async (req, res)=>{
    const id_korisnik= req.user._id
    const id_vjezba= req.params.id
    const custom_vjezbe_collection= db.collection('customVjezbe')

    const postoji= await custom_vjezbe_collection.findOne({ _id: new ObjectId(id_vjezba), id_korisnik: id_korisnik })

    if(!postoji){
        return res.status(404).json({greska: 'Vježba ne postoji'})
    }

    try{
        await custom_vjezbe_collection.deleteOne({ _id: new ObjectId(id_vjezba), id_korisnik: id_korisnik })

        return res.status(200).json({poruka: 'Vježba uspješno obrisana'})
    }catch(error){
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
})

export default router