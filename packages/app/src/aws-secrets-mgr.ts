import { NodeHttpHandler } from '@smithy/node-http-handler';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export class AWSSecretsManagerService {
  secretManagerClient: SecretsManagerClient;

  constructor(awsRegion: string) {    
    this.secretManagerClient = new SecretsManagerClient({ 
      endpoint: `http://127.0.0.1:3001`,
      region: awsRegion,
    });
  }

  getSecretValue = async (secretName: string, abortSignal?: AbortSignal): Promise<string> => {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const result = await this.secretManagerClient.send(command, abortSignal ? { abortSignal } : {});
    return result.SecretString ?? '';
  };
}

export class AWSSecretsManagerService2 {
  secretManagerClient: SecretsManagerClient;

  constructor(awsRegion: string) {    
    this.secretManagerClient = new SecretsManagerClient({ 
      endpoint: `http://127.0.0.1:3001`,
      region: awsRegion,            
      requestHandler: new NodeHttpHandler({ httpAgent: { 
        keepAlive: true,      
        maxSockets: 50, // Limit concurrent connections per host => This is our protagonist
        maxFreeSockets: 10, // Keep some connections in pool for some headroom
        timeout: 10000, // Kill connections after 10 seconds
      }}),
    });    
  }

  getSecretValue = async (secretName: string, abortSignal?: AbortSignal): Promise<string> => {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const result = await this.secretManagerClient.send(command, abortSignal ? { abortSignal } : {});
    return result.SecretString ?? '';
  };
}