import express from 'express';
import { splits } from '../data/data.js'
import { connectToDatabase } from '../db.js';
import { validirajSplit, idKorisnika, sviSplitovi, trenutniSplit } from '../middleware/middleware.js';
import { ObjectId } from 'mongodb'



const router = express.Router();

let db = await connectToDatabase();





export default router