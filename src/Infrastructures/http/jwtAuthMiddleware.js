/* istanbul ignore file */
import jwt from 'jsonwebtoken';
import AuthenticationError from '../../Commons/exceptions/AuthenticationError.js';
import config from '../../Commons/config.js';

const jwtAuthMiddleware = (req, _res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(new AuthenticationError('Missing authentication'));
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AuthenticationError('Missing authentication'));
  }

  try {
    const decoded = jwt.verify(token, config.auth.accessTokenKey);
    req.auth = { credentials: { id: decoded.id } };
    return next();
  } catch {
    return next(new AuthenticationError('Token tidak valid'));
  }
};

export default jwtAuthMiddleware;
