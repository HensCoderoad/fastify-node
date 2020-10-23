import { FastifyRequest, FastifyReply } from 'fastify';
import { ServerResponse } from 'http';

export const ErrorHandler = (
  err: any,
  req: FastifyRequest,
  res: FastifyReply
) => {
  const { statusCode, name, message } = err;

  req.log.error(err);

  res.code(statusCode || 500).send({
    error: {
      statusCode: statusCode || 500,
      name,
      message: message || '服务器异常'
    },
    data: undefined
  });
};