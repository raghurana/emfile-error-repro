import { setTimeout } from 'timers/promises';
import { AWSSecretsManagerService } from '../aws-secrets-mgr';
import { reloadLocalAndSecretsManagerValues } from '../env-vars';

// Instantiate AWS Secrets Manager outside of the function
const awsRegion = process.env.AWS_REGION || 'ap-southeast-2';
const awsSecretsManager = new AWSSecretsManagerService(awsRegion);

// Lambda handler
export const handler = async (event: unknown, context: unknown) => {
  console.log('Event:', event);

  const secretsToLoad: Record<string, string> = { documentDbCreds: 'documentDBCredentials' };
  const envVars = await reloadLocalAndSecretsManagerValues(awsSecretsManager, secretsToLoad);
  console.log('Loaded local and secret env vars', envVars);

  // Add artificial delay to simulate other processing lambda
  console.log('Waiting....');
  await setTimeout(5000);

  console.log('Execution complete - returning 200 OK');
  return { statusCode: 200, body: 'Ok' };
};
