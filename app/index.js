import express from 'express'
import vjezbaRouter from './routes/vjezba.js'



let port = 3000
let app= express()

app.use(express.json())
app.use('/vjezba', vjezbaRouter)


app.listen(port, (error)=>{
    if(error){
        console.error('Ne radi startanje')
    }
    else{
        console.error(`Posložitelj sluša na ${port}`)
    }
})

console.log(app)