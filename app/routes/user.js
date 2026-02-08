import express from 'express';
import { users, user_splits, splits, vjezbe, custom_vjezbe } from '../data/data.js'

import { connectToDatabase } from '../db.js';
import { idKorisnika, nadiKorisnika, sviSplitovi, trenutniSplit, validirajSplit, validirajVjezbu } from '../middleware/middleware.js';
import { checkPassword, generateJWT, hashPassword } from '../auth.js';
import { ObjectId } from 'mongodb'


const router = express.Router();

let db = await connectToDatabase();

router.get('/', async (req, res) => {
    let user_collection= db.collection('users')
    let sviUseri= await user_collection.find().toArray()
    res.status(200).json(sviUseri)
})


 
router.post('/registracija', [nadiKorisnika], async (req, res)=>{
    const novi_user= req.body

    if(req.user){
        return res.status(400).json({greska: 'korisnik već postoji'})
    }

    const obavezni_kljucevi= ['username', 'email', 'prehrana', 'lozinka']

    if(!obavezni_kljucevi.every(k => k in novi_user)){
        return res.status(400).json({error: 'Krivi oblik korisnika'})
    }

    if(!Array.isArray(novi_user.prehrana) || !novi_user.prehrana.length===7){
        return res.status(400).json({error: 'Krivi oblik prehrane'})
    }


    const user_collection= db.collection('users')

    let hash_lozinka= await hashPassword(novi_user.lozinka, 10)

    if(!hash_lozinka){
        return res.status(500).json({greska: `Greška pri hashiranju lozinke`})
    }

    novi_user.lozinka= hash_lozinka

    let rez={}

    try{

        rez= await user_collection.insertOne(novi_user)

        return res.status(201).json(rez.insertedId)
    } catch (error) {
        console.log(error.errorResponse)
        return res.status(400).json({error: `Desila se greška: ${error}`})
    }
})

router.post('/prijava', [nadiKorisnika], async (req, res)=>{
    const { lozinka }= req.body

    if(!req.user){
        return res.status(400).json({greska: 'korisnik ne postoji'})
    }

    const lozinka_postoji= await checkPassword(lozinka, req.user.lozinka)

    let jwt_payload={
        username: req.user.username,
        email: req.user.email,
        _id: req.user._id
    }

    let jwt_token= await generateJWT(jwt_payload)

    if(lozinka_postoji){
        return res.status(200).json({message: 'Uspješna autentifikacija', jwt_token: jwt_token})
    }
    return res.status(400).send('Greška prilikom prijave')    
})

router.post('/custom_split', [validirajSplit, idKorisnika], async (req, res)=>{
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

router.get('/split_biranje', [idKorisnika, sviSplitovi], async (req, res)=>{
    let svi_splitovi=req.svi_splitovi

    return res.status(200).json(svi_splitovi)
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

router.post('/custom_vjezba', [validirajVjezbu, idKorisnika], async (req, res)=>{
    const vjezbe_collection= db.collection('customVjezbe')

    const nova_vjezba= req.body

    if(!req.user){
        return res.status(401).json({greska: 'niste autorizirani za stvaranje custom splita'})
    }

    const korisnik_id= req.user._id

    let rez={}

    try{
        rez= await vjezbe_collection.insertOne(
            {
                ...nova_vjezba, 
                id_korisnik: korisnik_id
            }
        )

        return res.status(201).json(rez.insertedId)
    } catch(error){
        console.log(error)
        return res.status(400).json({greska: error.message})
    }
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