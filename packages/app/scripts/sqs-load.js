const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const batchSize = 1200;
const sqs = new SQSClient({ region: 'ap-southeast-2' });

(async () => {
  const sqsPromises = [];
  for (let i = 1; i <= batchSize; i++) {
    sqsPromises.push(
      sqs.send(
        new SendMessageCommand({
          QueueUrl: 'https://sqs.ap-southeast-2.amazonaws.com/422540769229/em-file-err-queue',
          MessageBody: JSON.stringify({ runId: 'rr-test', i }),
        })
      )
    );
  }

  // Run all requests in parallel and wait for completion
  const results = await Promise.allSettled(sqsPromises);
  results.forEach((result, idx) => {
    if (result.status === 'rejected') {
      console.error(`Failed to send message ${idx + 1}:`, result.reason);
      throw new Error('Execution terminated due to error.');
    }
  });
  const successCount = results.filter((result) => result.status === 'fulfilled').length;
  console.log(`Successfully sent ${successCount} messages in parallel to SQS`);
  console.log(`Successfully sent ${batchSize} messages in parallel to SQS`);
})();
