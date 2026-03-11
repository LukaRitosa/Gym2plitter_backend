import express from 'express';
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

router.get('/:id_dan', [idKorisnika, trenutniSplit, pronadeniDan, sveVjezbe], async (req, res)=>{
    const dan= req.dan
    const sve_vjezbe= req.sve_vjezbe

    const vjezbe= dan.vjezbe.map(v=>{
        const postoji= sve_vjezbe.find(vj => vj._id.toString()===v.id.toString())
        
        if (postoji) {
            return {
                ...postoji,
                id: postoji._id.toString(),
                brojSetova: v.broj_setova 
            }
        } else { 
            return {
                id: v.id,
                brojSetova: v.broj_setova 
            }
        }
    })

    return res.status(200).json({ ...dan, vjezbe: vjezbe})
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
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
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
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
})


router.put('/:id_dan/novi_setovi', [idKorisnika, trenutniSplit, pronadeniDan], async (req, res)=>{
    const id_split= req.trenutni_split._id

    const id_dan= Number(req.params.id_dan)

    const { vjezbe }= req.body

    if(!Array.isArray(vjezbe)){
        return res.status(400).json({greska: 'Nesipravni podatci'})
    }

    const stareVjezbe= req.dan.vjezbe

    const user_split_collection= db.collection('userSplits')

    try{

        for(const promjena of vjezbe){
            const postoji= stareVjezbe.find(v => v.id===promjena.id)

            if(!postoji){
                return res.status(400).json({greska: 'Vježba ne postoji u danu'})
            }

            if(!promjena.id || typeof promjena.broj_setova !== 'number' || promjena.broj_setova < 1){
                return res.status(400).json({greska: 'Nesipravan set'})
            }
        }

        const noveVjezbe= stareVjezbe.map(stara=>{
            const promjena= vjezbe.find(v => v.id===stara.id)

            if(!promjena) return stara

            return{
                ...stara,
                broj_setova: promjena.broj_setova
            }
        })
        await user_split_collection.updateOne(
            {
                _id: new ObjectId(id_split),
                "dani.dan": id_dan
            },
            {
                $set: { "dani.$.vjezbe": noveVjezbe }
            }
        )

        return res.status(200).json({poruka: 'Setovi uspješno ažurirani'})
    }catch(error){
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }

})

export default router