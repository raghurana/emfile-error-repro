import { type Context } from "aws-lambda";
import { AWSSecretsManagerService } from "./aws-secrets-mgr";
import { reloadLocalAndSecretsManagerValues } from "./env-vars";
import { log } from "./logger";

// Instantiate AWS Secrets Manager outside of the function
const awsRegion = process.env.AWS_REGION || "ap-southeast-2";
const awsSecretsManager = new AWSSecretsManagerService(awsRegion);

// Lambda handler
export const handler = async (event: unknown, context: Context) => {
  log.debug({
    "event.id": "logging.info.generic",
    additionalMessage: `Lambda handler called with event: ${JSON.stringify(
      event
    )} and context: ${JSON.stringify(context)}`,
  });

  // await reloadLocalAndSecretsManagerValues(awsSecretsManager);
  log.debug({
    "event.id": "logging.info.generic",
    additionalMessage: "Returning 200 Ok",
  });
  return { statusCode: 200, body: "Ok" };
};
