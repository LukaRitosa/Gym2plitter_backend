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



export default router