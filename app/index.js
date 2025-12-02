import express from 'express'
import splitRouter from './routes/split.js'
import userRouter from './routes/user.js'
import kalendarRouter from './routes/kalendar.js'



let port = 3000
let app= express()

app.use(express.json())
app.use('/split', splitRouter)
app.use('/user', userRouter)
app.use('/kalendar', kalendarRouter)


app.listen(port, (error)=>{
    if(error){
        console.error('Ne radi startanje')
    }
    else{
        console.error(`Posložitelj sluša na ${port}`)
    }
})

console.log(app)