import { APIGatewayProxyHandler } from 'aws-lambda';
import { HttpMethod, LambdaRouter } from '../../utils/lambda-router';
import { ShortBot } from './shortBot';

export const handler: APIGatewayProxyHandler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const lambdaRouter = new LambdaRouter(event, context, callback);

  lambdaRouter.route(HttpMethod.POST, '/short-bot', (event) => ShortBot(event));
};
