const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const totalMessages = 12000;
const batchSize = 1200;
const sqs = new SQSClient({ region: 'ap-southeast-2' });
const queueUrl = 'https://sqs.ap-southeast-2.amazonaws.com/422540769229/em-file-err-queue';

(async () => {
  let sentCount = 0;
  for (let batch = 0; batch < totalMessages / batchSize; batch++) {
    const sqsPromises = [];
    const start = batch * batchSize + 1;
    const end = start + batchSize - 1;
    for (let i = start; i <= end; i++) {
      sqsPromises.push(
        sqs.send(
          new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify({ runId: 'rr-test', i }),
          })
        )
      );
    }
    // Run this batch in parallel and wait for completion
    const results = await Promise.allSettled(sqsPromises);
    results.forEach((result, idx) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send message ${start + idx}:`, result.reason);
        throw new Error('Execution terminated due to error.');
      }
    });
    const successCount = results.filter((result) => result.status === 'fulfilled').length;
    sentCount += successCount;
    console.log(`Batch ${batch + 1}: Successfully sent ${successCount} messages (messages ${start}-${end}) to SQS`);
  }
  console.log(`Successfully sent ${sentCount} messages in total to SQS`);
})();
