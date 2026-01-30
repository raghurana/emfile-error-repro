import { handlerLoop, cleanUp } from './lambdas/em-err-lambda';
import { slowServer } from './slow-server';

const slowServerDelaySecs = 1;
slowServer({ port: 3001, delayMs: slowServerDelaySecs * 1000 })
  .then(() => console.log(`Slow server running on http://127.0.0.1:${3001} delaying ${slowServerDelaySecs}s per request.`))
  .catch(console.error);

handlerLoop(1500)
  .catch(console.error)  
  .finally(() => {
    cleanUp();
    console.log('Finished')
  });
