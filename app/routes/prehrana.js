import express from 'express';
import { connectToDatabase } from '../db.js';
import { idKorisnika } from '../middleware/middleware.js';
import { ObjectId } from 'mongodb'
import { nadiDanPrehrane, prehranaValidna } from '../middleware/prehrana_middleware.js';
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
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
})

router.get('/:datum',  [idKorisnika, nadiDanPrehrane], async (req, res)=>{
    const dan_prehrane= req.dan_prehrane
    
    return res.status(200).json(dan_prehrane)

})

router.patch('/:datum/:obrok/dodaj', [idKorisnika, prehranaValidna, nadiDanPrehrane, sviObroci, svaHrana], async (req, res)=>{
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

    const postoji = dan_prehrane.pojedeno[obrok].find(h => h._id.toString() === hrana._id.toString())

    if(postoji){
        return res.status(400).json({greska: 'Stavka već postoji u ovom obroku. Uredite količinu.'})
    }

    const user_collection= db.collection('users')

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


        await user_collection.updateOne(
            { _id: new ObjectId(req.user._id), 'prehrana.datum': dan_prehrane.datum },
            { $set: { 'prehrana.$': dan_prehrane } }
        )

        return res.status(200).json({poruka: 'Uspješno dodavanje stavke'})
    } catch(error){
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
})

router.patch('/:datum/:obrok/ukloni/:id', [idKorisnika, prehranaValidna, nadiDanPrehrane], async (req, res)=>{
    const id= req.params.id
    const obrok= req.params.obrok
    let dan_prehrane= req.dan_prehrane

    if(obrok!=='marenda' && obrok!=='rucak' && obrok!=='vecera' && obrok!=='snack' && obrok!=='nekarakterizirano'){
        return res.status(400).json({greska: 'Krivi obrok'})
    }

    if(!id){
        return res.status(400).json({greska: 'Niste odabrali vježbu za ulkanjanje'})
    }

    const hrana= dan_prehrane.pojedeno[obrok].find(h => h._id.toString() === id)

    if(!hrana){
        return res.status(400).json({greska: 'Hrana koju pokušavate ukloniti ne postoji'})
    }

    const user_collection= db.collection('users')


    try{

        let kalorije= hrana.kalorije

        let proteini= hrana.proteini

        dan_prehrane.pojedeno[obrok]= dan_prehrane.pojedeno[obrok].filter(h => h._id.toString() !== id)

        dan_prehrane.ostvareneKalorije-= kalorije
        dan_prehrane.ostvareniProteini-= proteini
        


        await user_collection.updateOne(
            { _id: new ObjectId(req.user._id), 'prehrana.datum': dan_prehrane.datum },
            { $set: { 'prehrana.$': dan_prehrane } }
        )

        return res.status(200).json({poruka: 'Uspješno uklanjanje vježbe'})
    } catch(error){
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
})

router.put('/update', [idKorisnika], async (req, res)=>{
    const user_collection= db.collection('users')

    let korisnik= await user_collection.findOne({_id: new ObjectId(req.user._id)})

    let kalendar= korisnik.prehrana

    let danasDate= new Date()

    let danasString= danasDate.toLocaleDateString("sv-SE")

    let index_dana= kalendar.findIndex(d => d.datum===danasString)
    
    if(index_dana===6){
        return res.status(400).json({greska: 'Pokušavate ažurirati točan kalendar'})
    }

    const zadnjiDate = new Date(kalendar.at(-1).datum)

    const razlika = Math.floor((danasDate - zadnjiDate) / (1000 * 60 * 60 * 24))

    function prazan_dan(datum){
        return{
            datum: datum,
            ostvareneKalorije: 0,
            ostvareniProteini: 0,
            pojedeno: {
                marenda: [],
                rucak: [],
                vecera: [],
                snack: [],
                nekarakterizirano: []
            }
        }
    }

    let prehrana= []

    try{

        if(razlika>6 || razlika<0 || kalendar.length !== 7){
            for(let i=6; i>=0; i--){
                let d= new Date()
                d.setDate(danasDate.getDate()-i)
                let datum= d.toLocaleDateString("sv-SE")
                prehrana.push(prazan_dan(datum))
            }
        }


        else{
            prehrana= [...kalendar]

            for(let i=razlika - 1; i>=0; i--){
                prehrana.shift()
                let d= new Date()
                d.setDate(danasDate.getDate()-i)
                let datum= d.toLocaleDateString("sv-SE")
                prehrana.push(prazan_dan(datum))
            }
        }

        await user_collection.updateOne({ _id: new ObjectId(req.user._id) }, { $set: { prehrana: prehrana } })

        return res.status(200).json({poruka: 'dan uspješno ažuriran'})

    } catch(error){
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
})

router.patch('/:datum/:obrok/uredi/:id', [idKorisnika, prehranaValidna, nadiDanPrehrane], async (req, res)=>{
    const id_stavka= req.params.id
    const obrok= req.params.obrok
    const grami= req.body.grami

    let dan_prehrane= req.dan_prehrane

    if(!grami || grami <= 0){
        return res.status(400).json({greska: 'Krivi grami'})
    }

    if(obrok!=='marenda' && obrok!=='rucak' && obrok!=='vecera' && obrok!=='snack' && obrok!=='nekarakterizirano'){
        return res.status(400).json({greska: 'Krivi obrok'})
    }

    if(!id_stavka){
        return res.status(400).json({greska: 'Niste odabrali vježbu za ulkanjanje'})
    }

    const stavka= dan_prehrane.pojedeno[obrok].find(h => h._id.toString()=== id_stavka)

    if(!stavka){
        return res.status(404).json({greska: 'Stavka nije pronađena'})
    }

    const user_collection= db.collection('users')

    try{
        dan_prehrane.ostvareneKalorije-= stavka.kalorije
        dan_prehrane.ostvareniProteini-= stavka.proteini

        const kalorije_po_gramu= stavka.kalorije/stavka.grami
        const proteini_po_gramu= stavka.proteini/stavka.grami

        const nove_kalorije= Number((kalorije_po_gramu * grami).toFixed(2))
        const novi_proteini= Number((proteini_po_gramu * grami).toFixed(2))

        stavka.grami= grami
        stavka.kalorije= nove_kalorije
        stavka.proteini= novi_proteini

        dan_prehrane.ostvareneKalorije+= nove_kalorije
        dan_prehrane.ostvareniProteini+= novi_proteini

        await user_collection.updateOne(
            { _id: new ObjectId(req.user._id), 'prehrana.datum': dan_prehrane.datum },
            { $set: { 'prehrana.$': dan_prehrane } }
        )
        
        return res.status(200).json({poruka: 'Stavka ažurirana'})
    } catch(error){
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
}) 

export default router