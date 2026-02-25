import express from 'express'
import { users, user_splits, splits, vjezbe, custom_vjezbe } from '../data/data.js'
import { connectToDatabase } from '../db.js';
import { validirajVjezbu, idKorisnika, sveVjezbe  } from '../middleware/middleware.js';
import { body, validationResult } from 'express-validator'




const router = express.Router();

let db = await connectToDatabase();



router.get('/', async (req, res)=>{
    let vjezbe_collection= db.collection('vjezbe')
    let sve_vjezbe= await vjezbe_collection.find().toArray()
    res.status(200).json(sve_vjezbe)
})


router.post('/', 
    [
        body('opis').exists(),
        body('glavni_misic').exists(),
        body('ostali_misici').exists(),
        body('slika').exists(),
        validirajVjezbu
    ], 
async (req, res)=>{

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
        console.log(error.errorResponse)
        return res.status(400).json({error: error.errorResponse})
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
        rez= await vjezbe_collection.insertOne(
            {
                ...nova_vjezba, 
                id_korisnik: korisnik_id
            }
        )

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.log(error)
        return res.status(400).json({greska: error.message})
    }
})

router.get('/biranje', [idKorisnika, sveVjezbe], async (req, res)=>{
    let sve_vjezbe=req.sve_vjezbe

    return res.status(200).json(sve_vjezbe)
}) 

export default router