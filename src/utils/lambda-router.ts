import { APIGatewayProxyEvent, APIGatewayProxyResult, Callback, Context } from 'aws-lambda';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export class HttpError {
  message: any;
  statusCode: number;
  constructor(obj: HttpError) {
    Object.assign(this, obj);
  }
}

export interface CustomAPIGatewayProxyEvent extends APIGatewayProxyEvent {
  body: any;
}

export class LambdaRouter {
  method: HttpMethod;

  // critical parameters for routing
  // resource carries the template string of path. i.e. /part1/{path_param1}/part2/{path_param2}
  path: string;

  constructor(
    private event: APIGatewayProxyEvent,
    private context: Context,
    private callback: Callback<APIGatewayProxyResult>
  ) {
    this.method = event.httpMethod as HttpMethod;
    this.path = event.resource;
  }

  private buildResponse(body: any, statusCode = 200): APIGatewayProxyResult {
    return {
      // Response status
      statusCode,
      // Response is of type string, so stringify
      body: JSON.stringify(body),
      // Handling cors. Change these as desired
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
    };
  }

  // Main route function
  async route(
    method: HttpMethod,
    path: string,
    handler: (event: CustomAPIGatewayProxyEvent, context: Context) => any | Promise<any>
  ): Promise<void> {
    console.log(JSON.stringify(this.event));
    // calling the passed handler if the designated method and path matches the request
    if (this.method === method && this.path === path) {
      try {
        // event body is a string and shall be parsed to JSON unless the request is of type GET
        if (method !== 'GET') {
          this.event.body = JSON.parse(String(this.event.body));
        }
        this.callback(null, this.buildResponse(await handler(this.event, this.context)));
      } catch (e: HttpError | any) {
        if (e instanceof HttpError) {
          if (e.statusCode === 500) {
            console.error(e.message);
          }
          this.callback(null, this.buildResponse({ error: e.message }, e.statusCode));
        } else {
          console.error(e);
          this.callback(null, this.buildResponse({ error: 'Internal server error' }, 500));
        }
      }
    }
  }
}
