import express from 'express';
import { splits } from '../data/data.js'
import { connectToDatabase } from '../db.js';



const router = express.Router();

let db = await connectToDatabase();




router.get('/', async (req, res)=>{
    let split_collection= db.collection('splits')
    let svi_splitovi= await split_collection.find().toArray()
    res.status(200).json(svi_splitovi)
})



 
router.post('/', async (req, res)=>{
    const splits_collection= db.collection('splits')

    const split= req.body

    const dozvoljeni_kljucevi=['naziv', 'broj_dana', 'opis', 'dani', 'kalendar']

    const split_kljucevi=Object.keys(split)

    const krivi_kljucevi=split_kljucevi.some(s=> !dozvoljeni_kljucevi.includes(s))

    if(krivi_kljucevi){
        return res.status(400).json({greska: 'krivi oblik splita'})
    }

    const dozvoljeni_kljucevi_dan=['dan', 'naziv', 'vjezbe']

    
    for (const dan of split.dani) {
        const kljucevi = Object.keys(dan)
        const krivi = kljucevi.some(k => !dozvoljeni_kljucevi_dan.includes(k))

        if (krivi) {
            return res.status(400).json({greska: 'krivi oblik dana u splitu'})
        }

        if (!Array.isArray(dan.vjezbe)) {
            return res.status(400).json({greska: 'vjezbe moraju biti array'})
        }
    }


    const dozvoljeni_kljucevi_vjezbe=['id', 'broj_setova']

    for (const dan of split.dani) {
        for (const vjezba of dan.vjezbe) {
            const kljucevi = Object.keys(vjezba);
            const krivi = kljucevi.some(k => !dozvoljeni_kljucevi_vjezbe.includes(k));

            if (krivi) {
                return res.status(400).json({
                    greska: 'krivi oblik vjezbe u splitu'
                });
            }
        }
    }

    const dozvoljeni_kljucevi_kalendar=['naziv', 'split_dan_id']

    
    if(typeof split.kalendar !== 'object' || Array.isArray(split.kalendar)) {
        return res.status(400).json({greska: 'kalendar mora biti objekt'})
    }

    for (const [datum, vrijednost] of Object.entries(split.kalendar)) {
        if(typeof vrijednost !== 'object' || Array.isArray(vrijednost)){
            return res.status(400).json({greska: 'krivi oblik kalendara u splitu'})
        }

        const kljucevi = Object.keys(vrijednost);
        const krivi = kljucevi.some(k => !dozvoljeni_kljucevi_kalendar.includes(k))

        if(krivi){
            return res.status(400).json({greska: 'krivi oblik kalendara u splitu'})
        }
    }

    if(Object.keys(split.kalendar).length!==14){
        return res.status(400).json({greska: 'Kalendar mora sadržavati 14 dana'})
    }

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