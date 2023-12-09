import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import middlewares from '../../api/middlewares';
import { celebrate, Joi } from 'celebrate';
import CoinCollabChannel from './coinCollabChannel';

const route = Router();

export default (app: Router) => {
  app.use('/showrunners/rosca', route);

  route.post(
    '/testnotif',
    celebrate({
      body: Joi.object({
        simulate: [Joi.bool(), Joi.object()],
      }),
    }),
    middlewares.onlyLocalhost,
    async (req: Request, res: Response, next: NextFunction) => {
      const Logger: any = Container.get('logger');

      try {
        const coinCollabChannel = Container.get(CoinCollabChannel);
        coinCollabChannel.helloWorld(req.body.simulate);
        return res.status(201).json({ success: true });
      } catch (e) {
        Logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
};
