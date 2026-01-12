import * as cdk from 'aws-cdk-lib';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class SecretsManager extends Construct {
  readonly documentDBCredentialsSecret: cdk.aws_secretsmanager.Secret;
  readonly eaiCreditialsSecret: cdk.aws_secretsmanager.Secret;
  readonly privateKeySecret: cdk.aws_secretsmanager.Secret;
  readonly publicKeySecret: cdk.aws_secretsmanager.Secret;
  readonly publicJwkSecret: cdk.aws_secretsmanager.Secret;
  readonly clientHashesSecret: cdk.aws_secretsmanager.Secret;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    this.documentDBCredentialsSecret = new secretsmanager.Secret(this, 'DocDbCredSecret', {
      secretName: 'documentDBCreds',
    });

    this.eaiCreditialsSecret = new secretsmanager.Secret(this, 'EaiCredSecret', {
      secretName: 'eaiCreds',
    });

    this.privateKeySecret = new secretsmanager.Secret(this, 'PrivateKeySecret', {
      secretName: 'privateKey',
    });

    this.publicKeySecret = new secretsmanager.Secret(this, 'PublicKeySecret', {
      secretName: 'publicKey',
    });

    this.publicJwkSecret = new secretsmanager.Secret(this, 'PublicJwkSecret', {
      secretName: 'publicJwk',
    });

    this.clientHashesSecret = new secretsmanager.Secret(this, 'ClientHashesSecret', {
      secretName: 'clientHashes',
    });
  }
}
