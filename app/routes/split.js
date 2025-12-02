import express from 'express';
import { splits } from '../data/data.js'
const router = express.Router();



router.get('/', (req, res)=>{
    res.status(200).json(splits)
})


export default router