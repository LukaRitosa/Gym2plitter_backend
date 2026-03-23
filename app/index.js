import express from 'express'
import splitRouter from './routes/split.js'
import userRouter from './routes/user.js'
import kalendarRouter from './routes/kalendar.js'
import vjezbaRouter from './routes/vjezba.js'
import hranaRouter from './routes/hrana.js'
import obrokRouter from './routes/obrok.js'
import splitDanRouter from './routes/split_dan.js'
import prehranaRouter from './routes/prehrana.js'
import cors from "cors"



let port = process.env.PORT || 3000
let app= express()

const corsOptions={
    origin: ['https://gym2plitter-frontend.onrender.com']
}

app.use(express.json())
app.use(cors(corsOptions))
 
app.use('/split', splitRouter)
app.use('/user', userRouter)
app.use('/kalendar', kalendarRouter)
app.use('/vjezbe', vjezbaRouter)
app.use('/hrana', hranaRouter)
app.use('/obrok', obrokRouter)
app.use('/split_dan', splitDanRouter)
app.use('/prehrana', prehranaRouter)


app.listen(port, (error)=>{
    if(error){
        console.error('Ne radi startanje')
    }
    else{
        console.error(`Posložitelj sluša na ${port}`)
    }
})


