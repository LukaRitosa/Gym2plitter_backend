import express from 'express';
import { users, user_splits, splits, vjezbe, custom_vjezbe } from '../data/data.js'
const router = express.Router();



router.get('/', (req, res)=>{
    return res.status(200).json(users)
})

router.get('/:id/splits', (req, res)=>{
    const id_user= req.params.id

    const user= users.find(u => u.id==id_user)

    if(!user){
        return res.status(404).json({greska: `Korisnik sa id-em ${id_user} ne postoji`})
    }

    const splitovi= user_splits.filter(s => user.user_splitovi.includes(s.id))

    if(splitovi.length==0){
        return res.status(200).json({odgovor: 'Trenutno nema splitova'})
    }

    return res.status(200).json(splitovi)

})

router.get('/:id/split', (req, res)=>{
    const id_user= req.params.id

    const user= users.find(u => u.id==id_user)

    if(!user){
        return res.status(404).json({greska: `Korisnik sa id-em ${id_user} ne postoji`})
    }

    const split= user_splits.find(s=> s.id==user.trenutniSplit_id)

    return res.status(200).json(split)
})

router.post('/:id_u/:id_s', (req, res)=>{
    const id_user= Number(req.params.id_u)
    const id_split=Number(req.params.id_s)

    const userIndex= users.findIndex(u=> u.id==id_user)

    if(userIndex==-1){
        return res.status(404).json({greska: `Korisnik s id-em ${id_user} ne postoji`})
    }

    const split= splits.find(s=> s.id==id_split)

    if(!split){
        return res.status(404).json({greska: `split s id-em ${id_split} ne postoji`})
    }

    const novi_id=user_splits.at(-1)['id'] + 1

    split.id=novi_id
       


    user_splits.push({...split})

    users.at(userIndex)['user_splitovi'].push(novi_id)

    return res.status(200).json(users.at(userIndex))

})


export default router