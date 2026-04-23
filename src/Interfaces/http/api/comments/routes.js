import { Router } from 'express';
import jwtAuthMiddleware from '../../../../Infrastructures/http/jwtAuthMiddleware.js';

const createCommentsRouter = (handler) => {
  const router = Router({ mergeParams: true });

  router.post('/', jwtAuthMiddleware, handler.postCommentHandler);
  router.delete('/:commentId', jwtAuthMiddleware, handler.deleteCommentHandler);

  return router;
};

export default createCommentsRouter;
