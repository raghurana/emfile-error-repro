import { AWSSecretsManagerService } from './aws-secrets-mgr';

// Environment interface
type Env = { [key: string]: string | undefined };

// Reload local and secrets manager values
export const reloadLocalAndSecretsManagerValues = async (
  awsSecretsManager: AWSSecretsManagerService,
  secretsToLoad: Record<string, string>
): Promise<Env> => {
  const env: Env = {};

  // Load pre-canned values
  Object.assign(env, { DB_NAME: 'my-db-name' });

  // Load values from Secrets Manager
  const secretMgrValues = await getSecretsManagerValues(awsSecretsManager, env, secretsToLoad);
  Object.assign(env, secretMgrValues);
  return env;
};

// Get secrets from Secrets Manager
const getSecretsManagerValues = async (
  awsSecMgr: AWSSecretsManagerService,
  env: Env,
  secretsToLoad: Record<string, string>
): Promise<Env> => {
  const secretsToMap: Record<string, string> = {};
  const getSecretPromises = Object.values(secretsToLoad).map((secretName) => awsSecMgr.getSecretValue(secretName));
  const secretValues = await Promise.all(getSecretPromises);
  Object.keys(secretsToLoad).forEach((envKey, index) => (secretsToMap[envKey] = secretValues[index] ?? ''));
  return mapValuesToEnv(secretsToMap, env);
};

// Map values to environment variables
const mapValuesToEnv = (secretsToMap: any, env: Env): Env => {
  const envSecrets: Env = {};
  Object.keys(secretsToMap).forEach((secretName) => {
    console.log(`Secrets Manager mapping using internal mapping key: ${secretName}`);
    if (secretName && secretsToMap[secretName]) {
      switch (secretName) {
        case 'documentDBCredentials': {
          const { username, password, host, port } = JSON.parse(secretsToMap[secretName]);
          envSecrets.DB_HOST = `${host}:${port}`;
          envSecrets.DB_PROVIDER = 'DocDB';
          const replicaSet = 'replicaSet=rs0&readPreference=secondaryPreferred';
          envSecrets.DB_CONNECTION_STRING = `mongodb://${username}:${password}@${host}:${port}/${env.DB_NAME}?${replicaSet}`;
          break;
        }
      }
    }
  });
  return envSecrets;
};
