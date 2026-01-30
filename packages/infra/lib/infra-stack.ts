import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SecretsManager } from './secrets';

export class EmFileErrInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Set known concurrency value
    const maxConcurrency = 1000;
    const lambdaTimeout = cdk.Duration.seconds(30);
    const visibilityTimeout = cdk.Duration.seconds(60); // > lambda timeout

    // Create Dead Letter Queue
    const dlq = new cdk.aws_sqs.Queue(this, 'EmFileErrSqsDlq', { queueName: 'em-file-err-dlq' });

    // Create SQS Queue with DLQ
    const queue = new cdk.aws_sqs.Queue(this, 'EmFileErrSqsQueue', {
      queueName: 'em-file-err-queue',
      visibilityTimeout: visibilityTimeout,
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 3,
      },
    });

    // Create Lambda function with inline TypeScript code
    const emFileErrLambda = new cdk.aws_lambda.Function(this, 'EmFileErrLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      functionName: 'em-err-lambda',
      timeout: lambdaTimeout,
      reservedConcurrentExecutions: 0,
      code: cdk.aws_lambda.Code.fromInline(`
        exports.handler = async (event) => {          
          return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Hello World processed successfully!' })
          };
        };
      `),
    });

    // Subscribe Lambda to SQS queue with event source mapping
    emFileErrLambda.addEventSource(
      new cdk.aws_lambda_event_sources.SqsEventSource(queue, {
        batchSize: 1,
        maxConcurrency: maxConcurrency,
      })
    );

    // Create Secrets Manager secret
    const allSecrets = new SecretsManager(this, 'InfraSecrets', props);

    // Grant Lambda permission to read the secret
    allSecrets.documentDBCredentialsSecret.grantRead(emFileErrLambda);
    allSecrets.eaiCreditialsSecret.grantRead(emFileErrLambda);
    allSecrets.privateKeySecret.grantRead(emFileErrLambda);
    allSecrets.publicKeySecret.grantRead(emFileErrLambda);
    allSecrets.publicJwkSecret.grantRead(emFileErrLambda);
    allSecrets.clientHashesSecret.grantRead(emFileErrLambda);
  }
}
