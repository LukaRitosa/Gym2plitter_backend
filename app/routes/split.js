import express from 'express';
import { splits } from '../data/data.js'
const router = express.Router();



router.get('/', (req, res)=>{
    res.status(200).json(splits)
})




router.post('', (req, res)=>{
    const split= req.body

    const dozvoljeni_kljucevi=['naziv', 'broj_dana', 'opis', 'dani', 'kalendar']

    const split_kljucevi=Object.keys(split)

    const krivi_kljucevi=split_kljucevi.some(s=> !dozvoljeni_kljucevi.includes(s))

    if(krivi_kljucevi){
        return res.status(400).json({greska: 'krivi oblik splita'})
    }

    const dozvoljeni_kljucevi_dan=['dan', 'naziv', 'vjezbe']

    const split_kljucevi_dan=Object.keys(split.dani)

    const krivi_kljucevi_dan=split_kljucevi_dan.some(s=> !dozvoljeni_kljucevi_dan.includes(s))

    if(krivi_kljucevi_dan){
        return res.status(400).json({greska: 'krivi oblik dana u splitu'})
    }

    const dozvoljeni_kljucevi_vjezbe=['id', 'broj_setova']

    const split_kljucevi_vjezbe= Object.keys(split.dan.vjezbe)

    const krivi_kljucevi_vjezbe=split_kljucevi_vjezbe.some(s=> !dozvoljeni_kljucevi_vjezbe.includes(s))

    if(krivi_kljucevi_vjezbe){
        return res.status(400).json({greska: 'krivi oblik vjezba u splitu'})
    }

    const dozvoljeni_kljucevi_kalendar=['dan', 'split_dan']

    const split_kljucevi_kalendar=Object.keys(split.kalendar)

    const krivi_kljucevi_kalendar=split_kljucevi_kalendar.some(s=> !dozvoljeni_kljucevi_kalendar.includes(s))

    if(krivi_kljucevi_kalendar){
        return res.status(400).json({greska: 'krivi oblik kalendara u splitu'})
    }

    const novi_id=splits.at(-1)['id'] + 1
    
    splits.push({
        id: novi_id,
        ...split
    })

    return res.status(201).json(splits.at(-1))
    
})


export default router