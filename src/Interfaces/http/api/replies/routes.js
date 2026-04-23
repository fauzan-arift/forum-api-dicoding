import { Router } from 'express';
import jwtAuthMiddleware from '../../../../Infrastructures/http/jwtAuthMiddleware.js';

const createRepliesRouter = (handler) => {
  const router = Router({ mergeParams: true });

  router.post('/', jwtAuthMiddleware, handler.postReplyHandler);
  router.delete('/:replyId', jwtAuthMiddleware, handler.deleteReplyHandler);

  return router;
};

export default createRepliesRouter;
