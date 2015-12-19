
@echo off

echo Installing NPM dependencies...
call npm install

echo Installing Typescript typings...
call tsd install
