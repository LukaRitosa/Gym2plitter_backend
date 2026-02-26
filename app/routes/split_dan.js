import express from 'express';
import { splits } from '../data/data.js'
import { connectToDatabase } from '../db.js';
import { idKorisnika } from '../middleware/middleware.js';
import { trenutniSplit } from '../middleware/split_middlewade.js';
import { ObjectId } from 'mongodb'
import { sveVjezbe } from '../middleware/vjezba_middleware.js';



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


router.patch('/:id_dan/vjezba/:id_vjezba', [idKorisnika, trenutniSplit, sveVjezbe], async (req, res)=>{
    const dani= req.trenutni_split.dani

    const id_dan= Number(req.params.id_dan)


    const dan= dani.find(d=> d.dan=== id_dan)

    if(!dan){
        return res.status(404).json({greska: 'Dan koji tražite ne postoji u ovom splitu'})
    }

    const id_vjezba= req.params.id_vjezba

    const sve_vjezbe=req.sve_vjezbe

    const vjezba= sve_vjezbe.find(v=> v._id.toString()=== id_vjezba)

    if(!vjezba){
        return res.status(404).json({greska: 'Vježba koju pokušavate dodati u dan ne postoji'})
    }

    if(dan.vjezbe.some(v => v.id=== id_vjezba)){
        return res.status(400).json({greska: `Vježba ${vjezba.naziv} je već u danu`})
    }

    dan.vjezbe.push({id: id_vjezba, broj_setova: 1})

    const novi_dani= dani.map(d => 
        (d.dan=== id_dan)  ? dan : d
    )

    const user_splits= db.collection('userSplits')

    try{
        await user_splits.updateOne({_id: new ObjectId(req.trenutni_split._id)}, {
            $set: { dani: novi_dani }
        })

        return res.status(200).json({poruka: 'Vježba uspješno dodana'})
    }catch(error){
        console.error(error)
        return res.status(500).json({greska: error})
    }
})


export default router