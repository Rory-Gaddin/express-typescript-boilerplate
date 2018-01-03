import { LoggingService, ErrorSeverity } from './logging-service';
import helpers = require('./helperFunctions');

export class APIResponseHandler {
    responseObject: any;
    status: number;
    data: any;
    messages: any;

    constructor(responseObject) {
        this.responseObject = responseObject;
        this.status = 200;
        this.data = [];
        this.messages = [];
    }

    addData(data) {
        this.data.push(data);
    }

    setData(data) {
        this.data = data;
    }

    addInfoMessage(message: string) {
        this.messages.push(message);
    }

    addError(error: Error, errStatus?) {
        if (!errStatus && this.status < 300) {
            this.status = 500;
        } else {
            if (errStatus > this.status) {
                this.status = errStatus;
            }
        }
        this.messages.push(error.message);

        LoggingService.Logger.logError(new Error(error.message), ErrorSeverity.Error);
    }

    sendResponse() {
        let res = this.responseObject;

        res.status(this.status);
        helpers.sendResponse(
            res, 
            {
                status: this.status,
                data: this.data,
                messages: this.messages
            },
            {}
        );
    }
}