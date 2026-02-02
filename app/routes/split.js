import express from 'express';
import { splits } from '../data/data.js'
import { connectToDatabase } from '../db.js';
import { validirajSplit } from '../middleware/middleware.js';



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


export default router