import http from 'node:http';

let batchCounter = 1;
const batchSize = 6; // Client is requesting 6 secrets in parallel

export const slowServer = (opts: { port: number; delayMs: number }) => {
  const server = http.createServer((req, res) => {
    req.on('data', () => {});
    req.on('end', () => {
      // Hold the connection open for the provided delay
      setTimeout(() => {
        const body = JSON.stringify({
          ARN: 'arn:aws:secretsmanager:ap-southeast-2:123456789012:secret:dummy',
          Name: 'dummy',
          SecretString: 'ok',
          VersionId: '1',
        });

        res.statusCode = 200;
        res.setHeader('content-type', 'application/x-amz-json-1.1');
        res.setHeader('content-length', Buffer.byteLength(body));
        res.end(body);
        if(++batchCounter % batchSize === 0) console.log(`  [SLOW-SERVER]:: Served batch: ${ batchCounter / batchSize }`);
      }, opts.delayMs);
    });
  });

  return new Promise<http.Server>((resolve) => {
    server.listen(opts.port, '127.0.0.1', () => resolve(server));
  });
};
