import express from 'express';
import { connectToDatabase } from '../db.js';
import { idKorisnika } from '../middleware/middleware.js';
import { kalendarUpToDate, trenutniSplit } from '../middleware/split_middlewade.js';
import { ObjectId } from 'mongodb'


const router = express.Router();

let db = await connectToDatabase();



router.get('/', [idKorisnika, trenutniSplit], async (req, res)=>{
    const trenutni_split= req.trenutni_split

    return res.status(200).json(trenutni_split.kalendar)
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
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
})

router.put('/postavi_odmor/:datum', [idKorisnika, trenutniSplit, kalendarUpToDate], async (req, res)=>{
    const user_split_collection= db.collection('userSplits')
    let trenutni_split= req.trenutni_split
    const datum= req.params.datum
    let kalendar= {...trenutni_split.kalendar}


    if(!kalendar[datum]){
        return res.status(404).json({greska: `Datum ${datum} nije u splitu`})
    }

    if(kalendar[datum].split_dan_id==null){
        return res.status(400).json({greska: `Dan ${datum} je već odmor`})
    }

    const original= {...kalendar}

    kalendar[datum]= {
        ...kalendar[datum],
        split_dan_id: null,
        naziv: "Odmor"
    }

    const datumi= Object.keys(kalendar).sort()
    const idx = datumi.indexOf(datum)
    const radniDani = datumi.slice(idx + 1).filter(d => original[d].split_dan_id !== null)

    let lastValid = { 
        split_dan_id: original[datum].split_dan_id, 
        naziv: original[datum].naziv 
    }

    try{
        for(const d of radniDani){
            kalendar[d]= {
                ...kalendar[d],
                split_dan_id: lastValid.split_dan_id,
                naziv: lastValid.naziv
            }
            lastValid= {
                split_dan_id: original[d].split_dan_id, 
                naziv: original[d].naziv 
            }
        }

        await user_split_collection.updateOne(
            {_id: new ObjectId(trenutni_split._id)},
            { $set: { kalendar: kalendar } }
        )

        return res.status(200).json({ poruka: 'Dan postavljen na odmor' })
    }catch (error) {
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
})

router.put('/preskoci/:datum', [idKorisnika, trenutniSplit, kalendarUpToDate], async (req, res)=>{
    const user_split_collection= db.collection('userSplits')
    const trenutni_split= req.trenutni_split
    const datum= req.params.datum
    const kalendar= {...trenutni_split.kalendar}

    if(!kalendar[datum]){
        return res.status(404).json({greska: `Datum ${datum} nije u splitu`})
    }

    if(kalendar[datum].split_dan_id==null){
        return res.status(400).json({greska: 'Ne možete preskočiti odmor'})
    }

    const datumi = Object.keys(kalendar).sort()

    const idx = datumi.indexOf(datum)

    let sljedeciDan = null

    for(let i=idx + 1; i<datumi.length; i++){
        if(kalendar[datumi[i]].split_dan_id !== null){
            sljedeciDan= datumi[i]
            break
        }
    }

    if(!sljedeciDan){
        return res.status(400).json({greska: 'Još ne možete preskočiti ovaj dan, jer nemate predviđen trening nakon njega uskoro'})
    }

    try{
        const temp={...kalendar[datum]}
        
        kalendar[datum]={...kalendar[sljedeciDan]}

        kalendar[sljedeciDan]= temp

        await user_split_collection.updateOne(
            { _id: new ObjectId(trenutni_split._id) },
            { $set: { kalendar: kalendar }}
        )

        return res.status(200).json({ poruka: 'Trening preskočen' })
    }catch (error) {
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
})

router.put('/otkazi_odmor/:datum', [idKorisnika, trenutniSplit, kalendarUpToDate], async(req, res)=>{
    const user_split_collection= db.collection('userSplits')
    const trenutni_split= req.trenutni_split
    const datum= req.params.datum
    const kalendar= {...trenutni_split.kalendar}

    const split_dani= trenutni_split.dani

    if(!kalendar[datum]){
        return res.status(404).json({greska: `Datum ${datum} nije u splitu`})
    }

    if(kalendar[datum].split_dan_id!==null){
        return res.status(400).json({greska: 'Dan za koji pokušavate otkazati odmor nije odmor'})
    }

    const datumi= Object.keys(kalendar).sort()

    const idx= datumi.indexOf(datum)

    const original= {...kalendar}

    let prviTrening= null
    let zadnjiTrening= null

    for(let i=idx + 1; i<datumi.length; i++){
        if(original[datumi[i]].split_dan_id !== null){
            prviTrening= datumi[i]
            break
        }
    }

    if(!prviTrening){
        for(let i=idx; i>0; i--){
            if(original[datumi[i]].split_dan_id !== null){
                zadnjiTrening= datumi[i]
                break
            }
        }
    }

    try{
        if(!prviTrening && !zadnjiTrening){
            kalendar[datum].split_dan_id= split_dani[0].dan
            kalendar[datum].naziv= split_dani[0].naziv
        }
        else if(!prviTrening){
            const zadnji_id= kalendar[zadnjiTrening].split_dan_id

            let dan_id= split_dani.findIndex(d => d.dan===zadnji_id)

            let sljedeci= split_dani[(dan_id + 1) % split_dani.length]

            kalendar[datum].split_dan_id= sljedeci.dan
            kalendar[datum].naziv= sljedeci.naziv
        }
        else{
            let lastValid={
                split_dan_id: original[prviTrening].split_dan_id,
                naziv: original[prviTrening].naziv
            }

            kalendar[datum]={
                ...kalendar[datum],
                split_dan_id: lastValid.split_dan_id,
                naziv: lastValid.naziv
            }

            const radniDani= datumi.slice(datumi.indexOf(prviTrening))

            for(const d of radniDani){
                if(original[d].split_dan_id===null){
                    continue
                }

                let index= datumi.indexOf(d)

                let sljedeci= null

                for(let i=index + 1; i<datumi.length; i++){
                    if(original[datumi[i]].split_dan_id !== null){
                        sljedeci= datumi[i]
                        break
                    }
                }

                if(sljedeci){
        
                    lastValid= {
                        split_dan_id: original[sljedeci].split_dan_id,
                        naziv: original[sljedeci].naziv
                    }

                    kalendar[d]={
                        ...kalendar[d],
                        split_dan_id: lastValid.split_dan_id,
                        naziv: lastValid.naziv
                    }

                }

                if(!sljedeci){
                    let zadnjiIndex = split_dani.findIndex(d => d.dan === lastValid.split_dan_id)

                    let sljedeci_dan= split_dani[(zadnjiIndex + 1) % split_dani.length]

                    kalendar[d]={
                        ...kalendar[d],
                        split_dan_id: sljedeci_dan.dan,
                        naziv: sljedeci_dan.naziv
                    }
                }

                sljedeci= null
            }
        }

        await user_split_collection.updateOne(
            {_id: new ObjectId(trenutni_split._id)},
            { $set: { kalendar: kalendar } }
        )

        return res.status(200).json({ poruka: 'Odmor otkazan' })
    }catch (error) {
        console.error('Greška:', error)
        return res.status(500).json({ greska: 'Greška u sustavu' })
    }
})


export default router