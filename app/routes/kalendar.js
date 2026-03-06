import express from 'express';
import { users, user_splits, splits, vjezbe, custom_vjezbe } from '../data/data.js'

import { connectToDatabase } from '../db.js';
import { idKorisnika, nadiKorisnika } from '../middleware/middleware.js';
import { trenutniSplit } from '../middleware/split_middlewade.js';
import { checkPassword, generateJWT, hashPassword } from '../auth.js';
import { ObjectId } from 'mongodb'


const router = express.Router();

let db = await connectToDatabase();



router.get('/', [idKorisnika, trenutniSplit], async (req, res)=>{
    const trenutni_split= req.trenutni_split

    return res.status(200).json(trenutni_split.kalendar)
})


router.patch('/', [idKorisnika, trenutniSplit], async (req, res)=>{
    const trenutni_split= req.trenutni_split

    const novi_kalendar=req.body


    if (!novi_kalendar || typeof novi_kalendar !== 'object' || Array.isArray(novi_kalendar)) {
        return res.status(400).json({ greska: 'Krivi oblik kalendara' })
    }

    const datumi = Object.keys(novi_kalendar)

    if (datumi.length < 14) {
        return res.status(400).json({ greska: 'Kalendar mora imati najmanje 14 dana' })
    }

    datumi.sort()

    const danas = new Date().toISOString().split('T')[0]

    if (datumi[0] !== danas) {
        return res.status(400).json({ greska: 'Prvi datum mora biti današnji' })
    }

    const user_splits= db.collection('userSplits')


    let rez={}

    try{

        rez= await user_splits.updateOne({_id: new ObjectId(trenutni_split._id)}, {$set: {kalendar: novi_kalendar}})

        return res.status(200).json({poruka: 'Kalendar ažuriran'})
    } catch(error){
        console.error(error)
        return res.status(500).json({greska: 'desila se greška u sustavu'})
    }
})


router.put('/update', [idKorisnika, trenutniSplit], async (req, res)=>{
    const user_collection= db.collection('users')
    const user_split_collection= db.collection('userSplits')

    const korisnik= await user_collection.findOne({_id: new ObjectId(req.user._id)})

    const trenutni_split= req.trenutni_split

    let kalendar= {...trenutni_split.kalendar}

    const slobodni_dani= korisnik.slobodni_dani
    const split_dani= trenutni_split.dani
    const split_broj_dana= trenutni_split.broj_dana

    let danasDate= new Date()
    let danasString= danasDate.toLocaleDateString("sv-SE")

    const sviDani = Object.keys(kalendar).sort()

    let brojac = 0

    try{
        for(const dan of sviDani){
            if(dan < danasString){
                delete kalendar[dan]
                brojac++
            }
        }

        if(brojac===0){
            return res.status(200).json({poruka: 'Kalendar validan'})
        }

        if(brojac===14){
            kalendar={}

            let datum= new Date()
            let zadnji_split_dan= 0

            for(let i=0; i<14; i++){

                const datumISO = datum.toLocaleDateString("sv-SE")
                const danUTjednu = datum.toLocaleDateString("hr-HR",{weekday:"long"})

                zadnji_split_dan= (zadnji_split_dan + 1) % split_broj_dana

                if(slobodni_dani.includes(danUTjednu)){
                    kalendar[datumISO] = {
                        split_dan_id: split_dani[zadnji_split_dan].dan,
                        naziv: split_dani[zadnji_split_dan].naziv
                    }
                }
                else{
                    kalendar[datumISO] = {
                        split_dan_id: null,
                        naziv: "Odmor"
                    }
                }
                datum.setDate(datum.getDate() + 1)
            }

        } else{

            const zadnjiDatumString = Object.keys(kalendar).sort().at(-1)

            let zadnjiDatum = new Date(zadnjiDatumString)

            const radniDani = sviDani.filter(d => kalendar[d] && kalendar[d].split_dan_id !== null)

            let zadnji_datum_id= radniDani.at(-1)

            let zadnji_split_dan=kalendar[zadnji_datum_id].split_dan_id

            for(let i=0; i<brojac; i++){

                zadnjiDatum.setDate(zadnjiDatum.getDate()+1)

                const datumISO = zadnjiDatum.toLocaleDateString("sv-SE")

                const danUTjednu = zadnjiDatum.toLocaleDateString("hr-HR",{weekday:"long"})

                zadnji_split_dan = (zadnji_split_dan + 1) % split_broj_dana

                if(slobodni_dani.includes(danUTjednu)){
                    kalendar[datumISO] = {
                        split_dan_id: split_dani[zadnji_split_dan].dan,
                        naziv: split_dani[zadnji_split_dan].naziv
                    }
                }
                else{
                    kalendar[datumISO] = {
                        split_dan_id: null,
                        naziv: "Odmor"
                    }
                }
            }
        }
        
        await user_split_collection.updateOne({ _id: new ObjectId(trenutni_split._id) }, { $set: { kalendar: kalendar } })

        return res.status(200).json({poruka: 'dan uspješno ažuriran'})

    } catch(error){
        console.error(error)
        return res.status(500).json({greska: error})
    }
})



export default router