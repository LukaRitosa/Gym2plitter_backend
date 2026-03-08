import { connectToDatabase } from "../db.js"
import { ObjectId } from 'mongodb'

let db= await connectToDatabase()

 
export const nadiDanPrehrane= async (req, res, next)=>{
    const id_korisnik= req.user._id

    const datum= req.params.datum

    const user_collection= db.collection('users')

    const korisnik= await user_collection.findOne({_id: new ObjectId(id_korisnik)})

    const dan_prehrane= korisnik.prehrana.find(p=>p.datum===datum)

    if(!dan_prehrane){
        return res.status(404).json({greska: 'Ne postoji taj datum'})
    }

    req.dan_prehrane= dan_prehrane
    
    return next()
}


export const prehranaValidna= async (req, res, next)=>{
    const user_collection= db.collection('users')
    const korisnik= await user_collection.findOne({_id: new ObjectId(req.user._id)})

    const prehrana= korisnik.prehrana

    if(!Array.isArray(prehrana)){
        return res.status(400).json({greska: 'Prehrana mora biti array'})
    }

    if(prehrana.length !== 7){
        return res.status(400).json({greska: 'Prehrana mora imati 7 dana'})
    }

    const danas= new Date()

    let ocekivani_datumi= []

    for(let i=6; i>=0; i--){
        let d= new Date(danas)
        d.setDate(danas.getDate() - i)
        ocekivani_datumi.push(d.toLocaleDateString("sv-SE"))
    }

    for(let i=0; i<7; i++){
        let dan= prehrana[i]

        if(typeof dan!=="object"){
            return res.status(400).json({greska: "Krivi oblik datuma"})
        }

        if(dan.datum!==ocekivani_datumi[i]){
            return res.status(400).json({greska: 'Nespravan kalendar prehrane'})
        }
    }

    return next()
} 