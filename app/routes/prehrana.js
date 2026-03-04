import express from 'express';
import { connectToDatabase } from '../db.js';
import { idKorisnika, nadiKorisnika } from '../middleware/middleware.js';
import { ObjectId } from 'mongodb'
import { nadiDanPrehrane } from '../middleware/prehrana_middleware.js';
import { sviObroci } from '../middleware/obrok_middleware.js';
import { svaHrana } from '../middleware/hrana_middleware.js';


const router = express.Router();

let db = await connectToDatabase();


router.get('/',  [idKorisnika], async (req, res)=>{
    const id_korisnik= req.user._id

    const user_collection= db.collection('users')

    try{
        const korisnik= await user_collection.findOne({_id: new ObjectId(id_korisnik)})

        return res.status(200).json(korisnik.prehrana)
    }catch(error){
        console.error(error)
        return res.status(500).json({greska: error})
    }
})

router.get('/:datum',  [idKorisnika, nadiDanPrehrane], async (req, res)=>{
    const dan_prehrane= req.dan_prehrane
    
    return res.status(200).json(dan_prehrane)

})

router.patch('/:datum/:obrok/dodaj', [idKorisnika, nadiDanPrehrane, sviObroci, svaHrana], async (req, res)=>{
    const zahtjev= req.body
    const obrok= req.params.obrok
    const svi_obroci= req.svi_obroci
    const sva_hrana= req.sva_hrana
    let dan_prehrane= req.dan_prehrane

    if(obrok!=='marenda' && obrok!=='rucak' && obrok!=='vecera' && obrok!=='snack' && obrok!=='nekarakterizirano'){
        return res.status(400).json({greska: 'Krivi obrok'})
    }

    if(!zahtjev.id || !zahtjev.grami){
        return res.status(400).json({greska: 'Krivi oblik hrane'})
    }

    const pronadeniObrok= svi_obroci.find(o => o._id.toString()===zahtjev.id)
    const pronadenaHrana= sva_hrana.find(h => h._id.toString()===zahtjev.id)

    if(!pronadeniObrok && !pronadenaHrana){
        return res.status(400).json({greska: 'Hrana koju pokušavate dodati ne postoji'})
    }

    let hrana = pronadeniObrok || pronadenaHrana

    try{

        let kalorije= Number(((zahtjev.grami/hrana.grami) * hrana.kalorije).toFixed(2))

        let proteini= Number(((zahtjev.grami/hrana.grami) * hrana.proteini).toFixed(2))

        dan_prehrane.pojedeno[obrok].push({
            _id: hrana._id,
            naziv: hrana.naziv,
            grami: zahtjev.grami,
            kalorije: kalorije,
            proteini: proteini
        })

        dan_prehrane.ostvareneKalorije+= kalorije
        dan_prehrane.ostvareniProteini+= proteini


        await db.collection('users').updateOne(
            { _id: new ObjectId(req.user._id), 'prehrana.datum': dan_prehrane.datum },
            { $set: { 'prehrana.$': dan_prehrane } }
        )

        return res.status(200).json({poruka: 'usijeh'})
    } catch(error){
        console.error(error)
        return res.status(500).json({greska: error})
    }
})


export default router