import * as cdk from 'aws-cdk-lib/core';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class EmFileErrInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Set known concurrency value
    const maxConcurrency = 100;
    const lambdaTimeout = cdk.Duration.seconds(30);
    const visibilityTimeout = cdk.Duration.seconds(60); // > lambda timeout

    // Create Dead Letter Queue
    const dlq = new sqs.Queue(this, 'EmFileErrSqsDlq', { queueName: 'em-file-err-dlq' });

    // Create SQS Queue with DLQ
    const queue = new sqs.Queue(this, 'EmFileErrSqsQueue', {
      queueName: 'em-file-err-queue',
      visibilityTimeout: visibilityTimeout,
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 3,
      },
    });

    // Create Lambda function with inline TypeScript code
    const emFileErrLambda = new lambda.Function(this, 'EmFileErrLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      functionName: 'em-err-lambda',
      timeout: lambdaTimeout,
      // reservedConcurrentExecutions: maxConcurrency,
      code: lambda.Code.fromInline(`
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
      new lambdaEventSources.SqsEventSource(queue, {
        batchSize: 1,
        maxConcurrency: maxConcurrency,
      })
    );

    // Create Secrets Manager secret
    const documentDBCredentialsSecret = new secretsmanager.Secret(this, 'DocDBCredSecret', {
      secretName: 'documentDBCredentials',
    });

    // Grant Lambda permission to read the secret
    documentDBCredentialsSecret.grantRead(emFileErrLambda);
  }
}
