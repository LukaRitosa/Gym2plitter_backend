import express from 'express';
import { splits } from '../data/data.js'
import { connectToDatabase } from '../db.js';
import { idKorisnika } from '../middleware/middleware.js';
import { pronadeniDan, trenutniSplit } from '../middleware/split_middlewade.js';
import { ObjectId } from 'mongodb'
import { sveVjezbe } from '../middleware/vjezba_middleware.js';



const router = express.Router();

let db = await connectToDatabase();


router.get('/', [idKorisnika, trenutniSplit], async (req, res)=>{
    const dani= req.trenutni_split.dani

    return res.status(200).json(dani)
})

router.get('/:id_dan', [idKorisnika, trenutniSplit, pronadeniDan], async (req, res)=>{
    const dan= req.dan

    return res.status(200).json(dan)
})


router.patch('/:id_dan/vjezba/:id_vjezba', [idKorisnika, trenutniSplit, pronadeniDan, sveVjezbe], async (req, res)=>{
    const id_split= req.trenutni_split._id

    const dan= req.dan

    const sve_vjezbe=req.sve_vjezbe

    const id_dan= Number(req.params.id_dan)

    const id_vjezba= req.params.id_vjezba



    const vjezba= sve_vjezbe.find(v=> v._id.toString()=== id_vjezba)

    if(!vjezba){
        return res.status(404).json({greska: 'Vježba koju pokušavate dodati u dan ne postoji'})
    }

    if(dan.vjezbe.some(v => v.id=== id_vjezba)){
        return res.status(400).json({greska: `Vježba ${vjezba.naziv} je već u danu`})
    }


    const user_splits= db.collection('userSplits')

    try{
        await user_splits.updateOne(
            { _id: new ObjectId(id_split), "dani.dan": id_dan },
            { $push: { "dani.$.vjezbe": { id: id_vjezba, broj_setova: 1 } } }
        )

        return res.status(200).json({poruka: 'Vježba uspješno dodana'})
    }catch(error){
        console.error(error)
        return res.status(500).json({greska: error})
    }
})


router.patch('/:id_dan/ukloni_vjezbu/:id_vjezba', [idKorisnika, trenutniSplit, pronadeniDan], async (req, res)=>{
    const id_split= req.trenutni_split._id

    let dan= req.dan

    const id_vjezba= req.params.id_vjezba

    const id_dan= Number(req.params.id_dan)


    const vjezba=dan.vjezbe.find(v => v.id=== id_vjezba)

    if(!vjezba){
        return res.status(400).json({greska: `Vježba nije u danu`})
    }


    const user_splits= db.collection('userSplits')

    try{
        await user_splits.updateOne(
            {
                _id: new ObjectId(id_split),
                "dani.dan": id_dan
            }, 
            {
                $pull: { "dani.$.vjezbe": { id: id_vjezba } }
            }
        )

        return res.status(200).json({poruka: 'Vježba uspješno uklonjena'})
    }catch(error){
        console.error(error)
        return res.status(500).json({greska: error})
    }
})


router.patch('/:id_dan/novi_setovi/:id_vjezba', [idKorisnika, trenutniSplit, pronadeniDan], async (req, res)=>{})

export default router