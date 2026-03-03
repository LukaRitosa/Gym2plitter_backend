import express from 'express';
import { users, user_splits, splits, vjezbe, custom_vjezbe } from '../data/data.js'

import { connectToDatabase } from '../db.js';
import { idKorisnika, nadiKorisnika } from '../middleware/middleware.js';
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

    if(!Array.isArray(novi_user.prehrana) || novi_user.prehrana.length!==7){
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

    if (!req.user) {
        return res.status(400).json({ greska: 'Greška prilikom prijave' })
    }

    const lozinka_postoji= await checkPassword(lozinka, req.user.lozinka)

    if(!lozinka_postoji){
        return res.status(401).send('Greška prilikom prijave')  
    }

    let jwt_payload={
        username: req.user.username,
        email: req.user.email,
        _id: req.user._id
    }

    let jwt_token= await generateJWT(jwt_payload)

    return res.status(200).json({message: 'Uspješna autentifikacija', jwt_token: jwt_token})  
})




router.patch('/test', [idKorisnika], async (req, res)=>{
    const id_user= req.user._id

    const user_collection= db.collection('users')

    const { slobodni_dani } = req.body

    const dozvoljeni_dani = [
        'ponedjeljak', 'utorak', 'srijeda',
        'četvrtak', 'petak', 'subota', 'nedjelja'
    ]

    if (!Array.isArray(slobodni_dani)) {
        return res.status(400).json({ greska: 'Slobodni dani moraju biti array' })
    }

    const krivi_kljucevi= slobodni_dani.some(d=> !dozvoljeni_dani.includes(d))

    if (krivi_kljucevi) {
        return res.status(400).json({ greska: 'Neispravan dan u tjednu' })
    }
    
    let rez={}

    try{
        rez= await user_collection.updateOne(
            {
                _id: new ObjectId(id_user)
            }, 
            {
                $set:{
                    slobodni_dani: slobodni_dani,
                    slobodnoVrijeme: `${slobodni_dani.length} ${slobodni_dani.length === 1 ? 'dan' : 'dana'}`
                }
            }
        )

        return res.status(200).json({ poruka: 'Uspješno ažurirano' })

    }catch(error){
        console.error(error)
        return res.status(500).json({greska: error})
    }
})

router.get('/profil', [idKorisnika], async (req, res)=>{
    const id_korisnik= req.user._id

    const user_collection= db.collection('users')

    try{
        const korisnik= await user_collection.findOne({_id: new ObjectId(id_korisnik)})

        return res.status(200).json(korisnik)
    }catch(error){
        console.error(error)
        return res.status(500).json({greska: error})
    }
})


router.patch('/kalkulator', [idKorisnika], async (req, res)=>{
    let { tezina, visina, dob, sex, cilj } = req.body
    const id_korisnik= req.user._id

    if (!tezina || !visina || !dob || !sex || !cilj) {
        return res.status(400).json({ greska: 'Sva polja su obavezna' })
    }

    if (!['m', 'f'].includes(sex) || !['mršavljanje', 'održavanje', 'povećanje mase'].includes(cilj)) {
        return res.status(400).json({ greska: 'Neispravni podatci' })
    }

    let bmr

    if(sex==='m'){
        bmr= 10 * tezina + 6.25 * visina - 5 * dob + 5
    } else{
        bmr= 10 * tezina + 6.25 * visina - 5 * dob - 161 
    }

    let kcal= bmr * 1.4

    if(cilj==='mršavljanje'){
        kcal-= 400
    }
    if(cilj==='povećanje mase'){
        kcal+= 300
    }

    const cilj_kalorije= Math.round(kcal)
    const cilj_proteini= Math.round(tezina*2)

    const user_collection= db.collection('users')

    let rez={}
    try{
        rez= await user_collection.updateOne(
            {_id: new ObjectId(id_korisnik)},
            {
                $set:{
                    tezina: tezina,
                    visina: visina,
                    dob: dob,
                    sex: sex,
                    cilj: cilj,
                    cilj_kalorije: cilj_kalorije,
                    cilj_proteini: cilj_proteini
                }
            }
        )
    return res.status(200).json({ poruka: 'Uspješno ažurirano' })

    }catch(error){
        console.error(error)
        return res.status(500).json({greska: error})
    }

})


export default router