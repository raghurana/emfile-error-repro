import { AWSSecretsManagerService } from '../aws-secrets-mgr';
import { reloadLocalAndSecretsManagerValues } from '../env-vars';

// Instantiate AWS Secrets Manager outside of the function
const awsRegion = process.env.AWS_REGION || 'ap-southeast-2';
const awsSecretsManager = new AWSSecretsManagerService(awsRegion);

// Lambda handler
export const handler = async (event: unknown, context: unknown) => {
  console.log('Event:', event);

  // await reloadLocalAndSecretsManagerValues(awsSecretsManager);

  console.log('Execution complete - returning 200 OK');
  return { statusCode: 200, body: 'Ok' };
};
