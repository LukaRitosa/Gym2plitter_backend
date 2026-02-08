import express from 'express'
import { users, user_splits, splits, vjezbe, custom_vjezbe } from '../data/data.js'
import { connectToDatabase } from '../db.js';
import { validirajVjezbu } from '../middleware/middleware.js';



const router = express.Router();

let db = await connectToDatabase();



router.get('/', async (req, res)=>{
    let vjezbe_collection= db.collection('vjezbe')
    let sve_vjezbe= await vjezbe_collection.find().toArray()
    res.status(200).json(sve_vjezbe)
})


router.post('/', [validirajVjezbu], async (req, res)=>{
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


export default router