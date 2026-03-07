import { connectToDatabase } from "../db.js";

let db= await connectToDatabase()


export const validirajVjezbu= async (req, res, next)=>{
    const nova_vjezba= req.body

    const dozvoljeni_kljucevi=['opis', 'glavni_misic', 'naziv', 'ostali_misici', 'slika']

    const kljucevi= Object.keys(nova_vjezba)

    const krivi_klucevi= kljucevi.some(k=> !dozvoljeni_kljucevi.includes(k))

    if(krivi_klucevi){
        return res.status(400).json({greska: 'Krivi oblik vježbe'})
    }

    const nema_obaveznih_kljuceva= dozvoljeni_kljucevi.filter(k => !nova_vjezba[k])

    if (nema_obaveznih_kljuceva.length > 0) {
        return res.status(400).json({greska: 'Nedostaju obavezna polja'})
    }

    if(!Array.isArray(nova_vjezba.ostali_misici)){
        return res.status(400).json({greska: 'ostali_misici mora biti array'})
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

    return next()
}


export const sveVjezbe= async(req, res, next)=>{
    let sve_vjezbe=[]

    const vjezbe_collection= db.collection('vjezbe')

    const custom_vjezbe_collection= db.collection('customVjezbe')

    if(!req.user){
        return res.status(401).json({greska: 'Nemate autorizaciju za pregled splitova'})
    }

    const korisnik_id=req.user._id

    const custom_vjezbe= await custom_vjezbe_collection.find({id_korisnik: korisnik_id}).toArray()

    const vjezbe_kolekcija= await vjezbe_collection.find().toArray()

    sve_vjezbe= [...custom_vjezbe, ...vjezbe_kolekcija]

    req.sve_vjezbe= sve_vjezbe

    return next()
}