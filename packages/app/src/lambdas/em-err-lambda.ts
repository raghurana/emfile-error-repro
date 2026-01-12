import { setTimeout } from 'timers/promises';
import { AWSSecretsManagerService } from '../aws-secrets-mgr';
import { reloadLocalAndSecretsManagerValues } from '../env-vars';

// Instantiate AWS Secrets Manager outside of the function
const awsRegion = process.env.AWS_REGION || 'ap-southeast-2';
const awsSecretsManager = new AWSSecretsManagerService(awsRegion);

// Lambda handler
export const handler = async (event: unknown, context: unknown) => {
  const secretsToLoad: Record<string, string> = {
    documentDbCreds: 'documentDBCreds',
    eaiCreds: 'eaiCreds',
    privateKey: 'privateKey',
    publicKey: 'publicKey',
    publicJwk: 'publicJwk',
    clientHashes: 'clientHashes',
  };

  try {
    const envVars = await reloadLocalAndSecretsManagerValues(awsSecretsManager, secretsToLoad);
    console.log('Execution complete - returning 200 OK', envVars);
    return { statusCode: 200, body: 'Ok' };
  } catch (e) {
    const ex = e as Error;
    console.error('BOMB!', ex.message);
    return { statusCode: 500, body: 'Handler Failed' };
  }
};
