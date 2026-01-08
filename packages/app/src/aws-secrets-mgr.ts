import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export class AWSSecretsManagerService {
  secretManagerClient: SecretsManagerClient;

  constructor(awsRegion: string) {
    this.secretManagerClient = new SecretsManagerClient({ region: awsRegion });
  }

  getSecretValue = async (secretName: string): Promise<string> => {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const result = await this.secretManagerClient.send(command);
    return result.SecretString ?? "";
  };
}
