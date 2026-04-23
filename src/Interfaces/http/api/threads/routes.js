import { Router } from 'express';
import jwtAuthMiddleware from '../../../../Infrastructures/http/jwtAuthMiddleware.js';

const createThreadsRouter = (handler) => {
  const router = Router();

  router.post('/', jwtAuthMiddleware, handler.postThreadHandler);
  router.get('/:threadId', handler.getThreadDetailHandler);

  return router;
};

export default createThreadsRouter;
