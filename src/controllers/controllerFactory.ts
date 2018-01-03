import { LoggingService, ErrorSeverity } from '../lib/logging-service';
import Promise = require('bluebird');
import { ConfigurationManager } from '../config/config';
import { AppRouteController } from '../app';
import fs = require('fs');
import path = require('path');

export class ControllerFactory {
    private static _controllers = {};

    public static getController(name: string): AppRouteController {
        return this._controllers[name];
    }

    public static get controllers(): Array<AppRouteController> {
        const controllers = new Array<AppRouteController>();

        Object.keys(this._controllers)
        .forEach(controller => controllers.push(this._controllers[controller]))

        return controllers;
    }

    public static initialize(): Promise<void> {
        return this.importControllers();
    }

    private static importControllers(): Promise<any> {
        const promises = [];
        const that = this;

        fs
        .readdirSync(__dirname)
        .filter(file => 
            file.indexOf('\.controller\.js') !== 0 
        &&  file.indexOf('\.map') === -1
        &&  file.indexOf('controllerFactory') === -1
        )
        .forEach(file => promises.push(
            import(path.join(__dirname, file))
            .then(imports => {
                const controller = imports.controller.prototype as AppRouteController;
                that._controllers[file.substring(0, file.indexOf('.'))] = controller;
            })
        ));

        return Promise.all(promises);
    }
}