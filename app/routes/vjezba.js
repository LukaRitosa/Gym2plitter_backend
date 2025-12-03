import express from 'express'
import { users, user_splits, splits, vjezbe, custom_vjezbe } from '../data/data.js'
const router = express.Router()



router.get('/', (req, res)=>{
    res.status(200).send('Tu su vježbe')
})

router.post('/', (req, res)=>{
    const nova_vjezba= req.body

    const dozvoljeni_kljucevi=['opis', 'glavni_misic', 'naziv', 'ostali_misici']

    const kljucevi= Object.keys(nova_vjezba)

    const krivi_klucevi= kljucevi.some(k=> !dozvoljeni_kljucevi.includes(k))

    if(krivi_klucevi){
        return res.status(400).json({greska: 'Krivi oblik vježbe'})
    }

    const svi_misici=[
        'Prsa',  'Trapez (gornji dio leđa)', 'Lat (najširi mišić leđa)', 
        'Biceps', 'Triceps', 'Podlaktice', 'Ramena-Bočni dio', 'Ramena-Prednji dio', 'Ramena-Stražnji dio',
        'Quadriceps (Prednja loža)', 'Hamstring (Stražnja loža)',  'List', 'Gluteus (stražnjica)', 'Trbuh'
    ]

    const krivi_misici=nova_vjezba.ostali_misici.some(m=> !svi_misici.includes(m))

    if(krivi_misici){
        return res.status(400).json({greska: 'Mišići vježbe nisu dozvoljeni'})
    }

    const novi_id= vjezbe.at(-1)['id'] + 1

    vjezbe.push({novi_id, ...nova_vjezba})

    return res.status(201).json(vjezbe.at(-1))
})


export default router