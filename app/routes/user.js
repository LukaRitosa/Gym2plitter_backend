import express from 'express';
import { users, user_splits, splits, vjezbe, custom_vjezbe } from '../data/data.js'

import { connectToDatabase } from '../db.js';



const router = express.Router();

let db = await connectToDatabase();

router.get('/', async (req, res) => {
    let user_collection= db.collection('users')
    let sviUseri= await user_collection.find().toArray()
    res.status(200).json(sviUseri)
})



router.post('/', async (req, res)=>{
    const user_collection= db.collection('users')
    const novi_user= req.body

    const obavezni_kljucevi= ['username', 'email', 'prehrana']

    if(!obavezni_kljucevi.every(k => k in novi_user)){
        return res.status(400).json({error: 'Krivi oblik korisnika'})
    }

    if(!Array.isArray(novi_user.prehrana) || !novi_user.prehrana.length===7){
        return res.status(400).json({error: 'Krivi oblik prehrane'})
    }

    let rez={}

    try{
        const postoji= await user_collection.find(u => u.email=== novi_user.email)

        if(postoji){
            return res.status(400).json({error: 'Korisnik kojeg pokušavate stvoriti već posoji'})
        }

        rez= await user_collection.insertOne(novi_user)

        return res.status(201).json(rez.insertedId)
    } catch (error) {
        console.log(error.errorResponse)
        return res.status(400).json({error: error.errorResponse})
    }
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

router.post('/:id_u/split/:id_s', (req, res)=>{
    const id_user= Number(req.params.id_u)
    const split=Number(req.params.id_s)

    const userIndex= users.findIndex(u=> u.id==id_user)

    if(userIndex==-1){
        return res.status(404).json({greska: `Korisnik s id-em ${id_user} ne postoji`})
    }

    const splitIndex=splits.findIndex(s=>s.id==split)

    if(splitIndex==-1){
        return res.status(404).json({greska: `Korisnik s id-em ${id_s} ne postoji`})
    }

    const novi_split=splits.at(splitIndex)



    
    const novi_id=user_splits.at(-1)['id'] + 1

    novi_split.id=novi_id
       


    user_splits.push({...novi_split})

    users.at(userIndex)['user_splitovi'].push(novi_id)

    return res.status(200).json({user: users.at(userIndex), split: user_splits.at(-1)})

})

router.get('/:id/dosupneVjezbe', (req, res)=>{
    const id_user=req.params.id

    const postoji=users.find(u=>u.id==id_user)

    if(!postoji){
        return res.status(404).json({greska: `Korisnik sa id-em ${id_user} ne postoji`})
    }

    const dostupne_vjezbe=[
        ...vjezbe,
        ...custom_vjezbe.filter(v=>v.id_usera==id_user)
    ]

    return res.status(200).json({'Dostupne vježbe:': dostupne_vjezbe})
})

router.post('/:id/vjezba', (req, res)=>{
    const id_user=Number(req.params.id)
    const nova_vjezba= req.body

    const index=users.findIndex(u=>u.id==id_user)

    if(index==-1){
        return res.status(404).json({greska: `Korisnik sa id-em ${id_user} ne postoji`})
    }

    const dozvoljeni_kljucevi=['naziv', 'opis', 'glavni_misic', 'ostali_misici']

    const kljucevi=Object.keys(nova_vjezba)
    const krivi_kljucevi=kljucevi.some(k=> !dozvoljeni_kljucevi.includes(k))

    if(krivi_kljucevi){
        return res.status(400).json({greska: 'Krivi oblik vježbe'})
    }

    const svi_misici=[
        'Prsa',  'Trapez (gornji dio leđa)', 'Lat (najširi mišić leđa)', 
        'Biceps', 'Triceps', 'Podlaktice', 'Ramena-Bočni dio', 'Ramena-Prednji dio', 'Ramena-Stražnji dio',
        'Quadriceps (Prednja loža)', 'Hamstring (Stražnja loža)',  'List', 'Gluteus (stražnjica)', 'Trbuh'
    ]


    const krivi_misic= !svi_misici.includes(nova_vjezba.glavni_misic)

    const krivi_misici=nova_vjezba.ostali_misici.some(m=> !svi_misici.includes(m))

    if(krivi_misici || krivi_misic){
        return res.status(400).json({greska: 'Mišići vježbe nisu dozvoljeni'})
    }

    const novi_id=custom_vjezbe.at(-1)['id'] + 1

    custom_vjezbe.push({
        id: novi_id,
        id_usera: id_user,
        ...nova_vjezba
    })

    users.at(index).custom_vjezbe.push(novi_id)

    return res.status(201).json({
        user:users.at(index), 
        vjezba: custom_vjezbe.at(-1)
    })


})


router.get('/:id/dan/:split_dan', (req, res)=>{
    const id_korisnik=req.params.id

    const id_dan=req.params.split_dan

    const korisnik= users.find(k=> k.id==id_korisnik)

    if(!korisnik){
        return res.status(404).json({greska: `Korisnik s id-em ${id_korisnik} ne postoji`})
    }

    const split= user_splits.find(s=> s.id==korisnik.trenutniSplit_id)

    const dan=split.dani.find(d=>d.dan == id_dan)

    if(dan.length==0){
        return res.status(404).json({greska: `U trenutnom splitu ne postoji dan ${id_dan}`})
    }

    const vjezbe_dan=dan.vjezbe

    if(vjezbe_dan.length==0){
        return res.status(200).json(dan)
    }

    const detaljne_vjezbe = vjezbe_dan.map(vj => {
        const vjezba = vjezbe.find(v => v.id == vj.id);
        return {
            ...vjezba,
            broj_setova: vj.broj_setova
        };
    });

    dan.vjezbe=detaljne_vjezbe

    return res.status(200).json(dan)
})


export default router