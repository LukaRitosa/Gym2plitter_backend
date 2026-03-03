import express from 'express';
import { users, user_splits, splits, vjezbe, custom_vjezbe } from '../data/data.js'

import { connectToDatabase } from '../db.js';
import { idKorisnika, nadiKorisnika } from '../middleware/middleware.js';
import { trenutniSplit } from '../middleware/split_middlewade.js';
import { checkPassword, generateJWT, hashPassword } from '../auth.js';
import { ObjectId } from 'mongodb'


const router = express.Router();

let db = await connectToDatabase();



router.get('/', [idKorisnika, trenutniSplit], async (req, res)=>{
    const trenutni_split= req.trenutni_split

    return res.status(200).json(trenutni_split.kalendar)
})


router.patch('/', [idKorisnika, trenutniSplit], async (req, res)=>{
    const trenutni_split= req.trenutni_split

    const novi_kalendar=req.body


    if (!novi_kalendar || typeof novi_kalendar !== 'object' || Array.isArray(novi_kalendar)) {
        return res.status(400).json({ greska: 'Krivi oblik kalendara' })
    }

    const datumi = Object.keys(novi_kalendar)

    if (datumi.length < 14) {
        return res.status(400).json({ greska: 'Kalendar mora imati najmanje 14 dana' })
    }

    datumi.sort()

    const danas = new Date().toISOString().split('T')[0]

    if (datumi[0] !== danas) {
        return res.status(400).json({ greska: 'Prvi datum mora biti današnji' })
    }

    const user_splits= db.collection('userSplits')


    let rez={}

    try{

        rez= await user_splits.updateOne({_id: new ObjectId(trenutni_split._id)}, {$set: {kalendar: novi_kalendar}})

        return res.status(200).json({poruka: 'Kalendar ažuriran'})
    } catch(error){
        console.error(error)
        return res.status(500).json({greska: 'desila se greška u sustavu'})
    }
})



export default router