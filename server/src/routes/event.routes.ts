import { Router } from 'express';
import { createUserEvent, getUserEvents, refreshUserEvents } from '../controllers/event.controller';

const router = Router();

router.get('/refresh', refreshUserEvents);
router.get('/', getUserEvents);
router.post('/', createUserEvent);

export default router;