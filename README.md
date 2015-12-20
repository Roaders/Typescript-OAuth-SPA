# Typescript-OAuth-SPA

An example Typescript / Angular implementation of an SPA (Single Page Application) using OAuth

Before compiling the app you will need to edit the googleConstants.ts file to enter your own client_id. A client id can be generated on the Google developers console: https://console.developers.google.com/apis/credentials

Once you have done this build the app as follows:

```bash
installDependencies
#( this will call npm to install node_modules and call tsd to install Typescript Declaration files)

compileApp
#(this will use node to compile the typescript files to javascript)
```

The Google implementation is based off the instructions here:
