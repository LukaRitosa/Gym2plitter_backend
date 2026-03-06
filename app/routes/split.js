import express from 'express';
import { connectToDatabase } from '../db.js';
import { idKorisnika } from '../middleware/middleware.js';
import { validirajSplit, sviSplitovi, trenutniSplit, dummyKalendar, pripremiDane } from '../middleware/split_middlewade.js';
import { ObjectId } from 'mongodb'
import { sveVjezbe } from '../middleware/vjezba_middleware.js';



const router = express.Router();

let db = await connectToDatabase();




router.get('/', async (req, res)=>{
    let split_collection= db.collection('splits')
    let svi_splitovi= await split_collection.find().toArray()
    res.status(200).json(svi_splitovi)
})



 
router.post('/', [validirajSplit, pripremiDane, dummyKalendar], async (req, res)=>{
    const splits_collection= db.collection('splits')

    const vjezba_collection= db.collection('vjezbe')

    const split= req.body

    const kalendar= req.kalendar

    let rez={}
    try{

        const postoji= await splits_collection.findOne({naziv: split.naziv})

        if(postoji){
            return res.status(400).json({error: 'Split kojeg pokušavate stvoriti već posoji'})
        }

        for(const d of split.dani){
            for(const v of d.vjezbe){
                let vjezba_postoji= await vjezba_collection.findOne({_id: new ObjectId(v)})

                if(!vjezba_postoji){
                    return res.status(404).json({greska: 'Vježba u splitu ne postoji'})
                }
            }
        }

        split.kalendar= kalendar
        
        rez= await splits_collection.insertOne(split)

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.log(error)
        return res.status(400).json({greska: error})
    }
})

router.post('/user_split/:id', [idKorisnika, sviSplitovi], async (req, res)=>{
    const split_id=req.params.id
    
    const id_user= req.user._id

    const svi_splitovi= req.svi_splitovi

    const split= svi_splitovi.find(s => s._id.toString() === split_id.toString())

    if(!split){
        return res.status(404).json({greska: 'split koji pokušavate odabrati ne postoji'})
    }

    const { _id, id_korisnik, ...split_data}= split

    const user_splits= db.collection('userSplits')
    const users_collection= db.collection('users')

    let rez={}
    try{
        rez= await user_splits.insertOne({id_korisnik: id_user.toString(), ...split_data})

        await users_collection.updateOne({_id: new ObjectId(id_user)}, {$set: {trenutniSplit: rez.insertedId.toString()}})

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.error(error)
        return res.status(500).json({greska: `greška: ${error}`})
    }
})

router.delete('/user_split/:id', [idKorisnika], async (req, res)=>{
    const split_id=req.params.id
    const id_user= req.user._id


    const user_splits= db.collection('userSplits')
    const users_collection= db.collection('users')    
    
    try{
        const split= await user_splits.findOne({ _id: new ObjectId(split_id), id_korisnik: id_user })

        if(!split){
            return res.status(404).json({greska: 'Pokušavate obrisati split koji ne postoji'})
        }
    
        await user_splits.deleteOne({_id: new ObjectId(split_id)})

        await users_collection.updateOne({_id: new ObjectId(id_user)}, {$set: {trenutniSplit: null}})

        return res.status(200).json({poruka: 'Split uspješno obrisan'})
    } catch(error){
        console.error(error)
        return res.status(500).json({greska: `greška: ${error}`})
    }
})

router.get('/trenutni', [idKorisnika, trenutniSplit], async (req, res)=>{
    const trenutni_split= req.trenutni_split

    return res.status(200).json(trenutni_split)
})


router.get('/biranje', [idKorisnika, sviSplitovi], async (req, res)=>{
    let svi_splitovi=req.svi_splitovi

    return res.status(200).json(svi_splitovi)
})

router.post('/custom', [validirajSplit, idKorisnika, pripremiDane, dummyKalendar, sveVjezbe], async (req, res)=>{
    const splits_collection= db.collection('customSplits')

    const novi_split=req.body

    const korisnik_id= req.user._id

    const kalendar= req.kalendar

    let rez={}
    try{
        const postoji= await splits_collection.findOne({naziv: novi_split.naziv, id_korisnik: korisnik_id})

        if(postoji){
            return res.status(400).json({error: 'Split kojeg pokušavate stvoriti već posoji'})
        }

        const sve_vjezbe_id = req.sve_vjezbe.map(v => v._id.toString())

        for(const dan of novi_split.dani){
            for(const v of dan.vjezbe){
                if(!sve_vjezbe_id.includes(v.id)){
                    return res.status(404).json({greska: `Vježba u splitu ne postoji`})
                }
            }
        }

        novi_split.kalendar= kalendar
        
        rez= await splits_collection.insertOne({id_korisnik: korisnik_id, ...novi_split})

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.log(error)
        return res.status(500).json({greska: error})
    }
})


export default router