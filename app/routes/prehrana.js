import express from 'express';
import { users, user_splits, splits, vjezbe, custom_vjezbe } from '../data/data.js'

import { connectToDatabase } from '../db.js';
import { idKorisnika, nadiKorisnika } from '../middleware/middleware.js';
import { checkPassword, generateJWT, hashPassword } from '../auth.js';
import { ObjectId } from 'mongodb'


const router = express.Router();

let db = await connectToDatabase();


router.get('/',  [idKorisnika], async (req, res)=>{
    const id_korisnik= req.user._id

    const user_collection= db.collection('users')

    try{
        const korisnik= await user_collection.findOne({_id: new ObjectId(id_korisnik)})

        return res.status(200).json(korisnik.prehrana)
    }catch(error){
        console.error(error)
        return res.status(500).json({greska: error})
    }
})

router.get('/:datum',  [idKorisnika], async (req, res)=>{
    const id_korisnik= req.user._id
    const datum= req.params.datum

    const user_collection= db.collection('users')

    try{
        const korisnik= await user_collection.findOne({_id: new ObjectId(id_korisnik)})

        const dan_prehrane= korisnik.prehrana.find(p=>p.datum===datum)

        if(!dan_prehrane){
            return res.status(404).json({greska: 'Ne postoji taj datum'})
        }


        return res.status(200).json(dan_prehrane)
    }catch(error){
        console.error(error)
        return res.status(500).json({greska: error})
    }
})


export default router