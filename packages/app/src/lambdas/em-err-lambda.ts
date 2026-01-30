import { AWSSecretsManagerService, AWSSecretsManagerService2 } from '../aws-secrets-mgr';
import { reloadLocalAndSecretsManagerValues } from '../env-vars';

const controllers: AbortController[] = [];
const awsRegion = process.env.region || 'ap-southeast-2';
const secretsToLoad: Record<string, string> = {
  documentDbCreds: 'documentDBCreds',
  eaiCreds: 'eaiCreds',
  privateKey: 'privateKey',
  publicKey: 'publicKey',
  publicJwk: 'publicJwk',
  clientHashes: 'clientHashes',
};

export const handlerLoop = async (concurrency: number) => {  
  console.log(`Firing ${concurrency} concurrent requests`);
  const promises = Array.from({ length: concurrency }, async (_, i) => {
    const ac = new AbortController();
    controllers.push(ac);

    try {
      // await badHandler({}, {}, ac.signal);
      await goodHandler({}, {}, ac.signal);
      return { i, ok: true };
    } catch (e: any) {
      console.error(`${i}. ${(e as Error).message}`);
      return { i, ok: false as const, err: String(e?.code || e?.name || e) };
    }
  });

  const results = await Promise.allSettled(promises);
  const failures = results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((v) => !v.ok);

  console.log(`Handler loop done. success=${results.length - failures.length}, failures=${failures.length}`);
  const emfile = failures.find((f) => (f.err || '').toUpperCase().includes('EMFILE'));
  if (emfile) console.log('EMFILE observed', emfile);
};

export const badHandler = async (event: unknown, context: unknown, abortSignal?: AbortSignal) => {  
  const awsSecretsManager = new AWSSecretsManagerService(awsRegion);
  const envVars = await reloadLocalAndSecretsManagerValues(awsSecretsManager, secretsToLoad, abortSignal);
  return { statusCode: 200, body: envVars };
};

// NOTE: declare single instance of secrets manager outside lambda for reuse
const awsSecretsManager = new AWSSecretsManagerService2(awsRegion);
export const goodHandler =  async (event: unknown, context: unknown, abortSignal?: AbortSignal) => {   
  const envVars = await reloadLocalAndSecretsManagerValues(awsSecretsManager, secretsToLoad, abortSignal);
  return { statusCode: 200, body: envVars };
};

export const cleanUp = () => {
  console.log('Aborting all requests to cleanup');
  for (const c of controllers) c.abort();
}