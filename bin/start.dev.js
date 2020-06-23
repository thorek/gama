const concurrently = require('concurrently');

console.info('Starting GAMA-on-Rails 🚀');
concurrently(
  [
    {
      command: 'ng serve',
      prefixColor: 'blue',
      name: 'ng'
    },
    {
      command: './server/node_modules/.bin/ts-node-dev -P ./server/tsconfig.json --no-notify --inspect -- ./server/app.ts --watch ./server',
      prefixColor: 'yellow',
      name: 'gql'
    }
  ],
  {
    prefix: 'name',
    killOthers: ['failure', 'success'],
    restartTries: 3
  }
);


