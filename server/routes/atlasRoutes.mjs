import express from 'express';
import { testAtlasConnection } from '../controllers/atlasController.mjs';

const router = express.Router();

// GET /api/test-atlas - Verify MongoDB Atlas connectivity and basic read/write
router.get('/', testAtlasConnection);

export default router;