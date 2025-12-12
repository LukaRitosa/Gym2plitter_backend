import express from 'express';
import { users, user_splits, splits, vjezbe, custom_vjezbe } from '../data/data.js'
const router = express.Router();



router.get('/:id', (req, res)=>{
    const id_user= req.params.id

    const user= users.find(u => u.id==id_user)

    if(!user){
        return res.status(404).json({greska: `Korisnik sa id-em ${id_user} ne postoji`})
    }

    const split= user_splits.find(s => s.id==user.trenutniSplit_id)

    if(!split){
        return res.status(200).json({odgovor: 'Korisnik nema aktivan split'})
    }

    return res.status(200).json(split.kalendar)
})


router.patch('/:id_u/zastarijeli', (req, res)=>{
    const id_user=req.params.id_u
    const novi_kalendar=req.body

    const korisnik=users.find(u=> u.id==id_user)

    if(!korisnik){
        return res.status(404).json({greska: `Korisnik sa id-em ${id_user} ne postoji`})
    }

    const split= user_splits.find(s => s.id==korisnik.trenutniSplit_id)

    if(!split){
        return res.status(200).json({odgovor: 'Korisnik trenutno nema odabran split'})
    }

    if(novi_kalendar.length<14){
        return res.status(400).json({greska: 'Krivi oblik kalendara'})
    }


    const splitIndex=splits.findIndex(s=>s.id==split.id)

    splits.at(splitIndex).kalendar=novi_kalendar

    return res.status(200).json(splits.at(splitIndex))
})



export default router