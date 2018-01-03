# express-typescript-boilerplate

Basic starter project that I use for new Express projects in TypeScript when building microservice APIs. If it helps you, then I am glad ;-)

Since most of what I do requires my services to be HTTPS-enabled, that's what this project assumes, too. In time I might create an HTTP-only branch with the necessary tweaks. PR's for this welcome, too, of course ;-)

A few pointers to get you up and running quickly...

## Pre-requisites

To state the "bleedin' obvious", you will need to have Node.js and NPM installed already. At time of writing this, I am using 8.9.1 with NPM version 5.0.4, but this project should play nice with earlier versions (no guarantees though).

Make sure that you have the latest stable version of TypeScript installed globally:

```
npm install -g typescript
```

Also, you should consider installing cpx and mkdirp globally, as it is useful for file-copying tasks within npm scripts. Having these libraries installed is required for the compilation of this project to work out-of-the-box.

```
npm install -g cpx
```

```
npm install -g mkdirp
```

## Quick start

Clone the repo to a nice, shiny new folder and run 

```
npm install
```

At this point, you should be able to check if everything is in order by running

```
npm run compile
```

This should invoke the TypeScript compiler, and you should now have a "./built" directory in your project root with the compiled .js files, as well as the default config.json file. It will also create an empty directory, sslcert, in which you will need to place your SSL certificate files. By default you will need to supply:

- server.key
- server.crt

Generating these files is beyond the scope of this README, but here are a few links you might find helpful:

- https://stackoverflow.com/questions/10175812/how-to-create-a-self-signed-certificate-with-openssl
- https://www.digitalocean.com/community/tutorials/openssl-essentials-working-with-ssl-certificates-private-keys-and-csrs
- https://www.ibm.com/support/knowledgecenter/en/SSWHYP_4.0.0/com.ibm.apimgmt.cmc.doc/task_apionprem_gernerate_self_signed_openSSL.html

Once you have your SSL cert in place, you can simply...

```
npm start
```

You should now be able to go to https://localhost:3000/api/test and, if all went according to plan, you should see a JSON response containing encouraging messages. Well done you!

## Next steps

Now that you've got the basic shell of your app running, you need to add the implementation for your routes. To do this, you can simply add a new file in the pattern ***xyz*.controller.ts** to the ./src/controllers directory. The example controller app.controller.ts serves as a basic template for this.

For the lowdown on all of the routing options, see the [Express docs](http://expressjs.com/en/4x/api.html#app.get.method).

## Some general guidelines

### Use tsc -w

After running the initial compile, I generally like to run tsc -w in a terminal to automagically run transpilation while I'm developing. This just saves me the hassle of running **npm run compile** every time I update a file.

Note, however, that  you will need to run a compile again if you change your config.json file. 

### Debugging

I use Visual Studio Code for my Express projects. If you, too, are such a sensible and well-mannered creature as I, you are welcome to pilfer my launch.json, which can be found below. This should make debugging your fancy TypeScript app a breeze...

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Debug .TS",
            "program": "${workspaceRoot}/src/app.ts",            
            "sourceMaps": true,
            "stopOnEntry": false,
            "console": "internalConsole",
            "cwd": "${workspaceRoot}",
            "outDir": "${workspaceFolder}/built"
        },
        {
            "type": "node",
            "request": "attach",
            "name": "Attach",
            "port": 5858
        },
        {
            "type": "node",
            "request": "launch",
            "name": "Debug Compiled .JS",
            "program": "${workspaceRoot}/built/app.js",
            "stopOnEntry": false,
            "console": "internalConsole",
            "cwd": "${workspaceRoot}"
        }
    ]
}
```