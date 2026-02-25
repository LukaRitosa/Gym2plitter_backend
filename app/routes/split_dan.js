import express from 'express';
import { splits } from '../data/data.js'
import { connectToDatabase } from '../db.js';
import { validirajSplit, idKorisnika, sviSplitovi, trenutniSplit } from '../middleware/middleware.js';
import { ObjectId } from 'mongodb'



const router = express.Router();

let db = await connectToDatabase();


router.get('/', [idKorisnika, trenutniSplit], async (req, res)=>{
    const dani= req.trenutni_split.dani

    return res.status(200).json(dani)
})

router.get('/:id', [idKorisnika, trenutniSplit], async (req, res)=>{
    const dani= req.trenutni_split.dani

    const id_dan= Number(req.params.id)

    const dan= dani.find(d=> d.dan=== id_dan)

    if(!dan){
        return res.status(404).json({greska: 'Dan koji tražite ne postoji u ovom splitu'})
    }

    return res.status(200).json(dan)
})


export default router