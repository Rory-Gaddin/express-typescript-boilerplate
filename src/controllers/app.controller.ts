import { Application, Request } from 'express';
import { Promise } from 'bluebird';
import { AppRouteController, ResponseWithHandler } from '../app';

export class ExampleRouteController implements AppRouteController {

    addRoutes (app: Application): void {
        /**
         * Test route
         */
        app.get('/api/test', (req: Request, res: ResponseWithHandler) => {
            res.handler.addInfoMessage('Your server is up and running, you bright young thing!');
            res.handler.setData({
                "description": "Some amazing data that your API is going to return to the client"
            });
            res.handler.sendResponse();
        });
    }
};

exports.controller = ExampleRouteController;
