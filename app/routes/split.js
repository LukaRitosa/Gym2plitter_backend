import express from 'express';
import { splits } from '../data/data.js'
import { connectToDatabase } from '../db.js';
import { validirajSplit, idKorisnika, sviSplitovi, trenutniSplit } from '../middleware/middleware.js';
import { ObjectId } from 'mongodb'



const router = express.Router();

let db = await connectToDatabase();




router.get('/', async (req, res)=>{
    let split_collection= db.collection('splits')
    let svi_splitovi= await split_collection.find().toArray()
    res.status(200).json(svi_splitovi)
})



 
router.post('/', [validirajSplit], async (req, res)=>{
    const splits_collection= db.collection('splits')

    const split= req.body

    let rez={}
    try{

        const postoji= await splits_collection.findOne({naziv: split.naziv})

        if(postoji){
            return res.status(400).json({error: 'Split kojeg pokušavate stvoriti već posoji'})
        }
        
        rez= await splits_collection.insertOne(split)

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.log(error.errorResponse)
        return res.status(400).json({error: error.errorResponse})
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

router.get('/trenutni_split', [idKorisnika, trenutniSplit], async (req, res)=>{
    const trenutni_split= req.trenutni_split

    return res.status(200).json(trenutni_split)
})


router.get('/biranje', [idKorisnika, sviSplitovi], async (req, res)=>{
    let svi_splitovi=req.svi_splitovi

    return res.status(200).json(svi_splitovi)
})

router.post('/custom', [validirajSplit, idKorisnika], async (req, res)=>{
    const splits_collection= db.collection('customSplits')

    const novi_split=req.body

    if(!req.user){
        return res.status(401).json({greska: 'niste autorizirani za stvaranje custom splita'})
    }

    const korisnik_id= req.user._id


    let rez={}
    try{
        const postoji= await splits_collection.findOne({naziv: novi_split.naziv, id_korisnik: req.user._id})

        if(postoji){
            return res.status(400).json({error: 'Split kojeg pokušavate stvoriti već posoji'})
        }
        
        rez= await splits_collection.insertOne({id_korisnik: korisnik_id, ...novi_split})

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.log(error.errorResponse)
        return res.status(400).json({error: error.errorResponse})
    }
})


export default router