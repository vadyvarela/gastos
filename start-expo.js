// Script alternativo para iniciar o Expo forçando CommonJS
process.env.NODE_OPTIONS = '--no-warnings --loader ./metro-loader.js';
require('expo/cli').start();
