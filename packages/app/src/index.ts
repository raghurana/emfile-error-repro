import { handler } from './lambdas/em-err-lambda';

handler({}, {})
  .catch(console.error)
  .then(console.log)
  .finally(() => console.log('Finished'));
