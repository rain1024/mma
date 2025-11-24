import { Router } from 'express';
import athletesRouter from './athletes';
import eventsRouter from './events';
import rankingsRouter from './rankings';
import promotionsRouter from './promotions';

const router = Router();

router.use('/athletes', athletesRouter);
router.use('/events', eventsRouter);
router.use('/rankings', rankingsRouter);
router.use('/promotions', promotionsRouter);

export default router;
