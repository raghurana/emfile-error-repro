QUEUE_URL="https://sqs.ap-southeast-2.amazonaws.com/422540769229/em-file-err-queue"
PAGER="cat"

for i in $(seq 1 2); do
  aws sqs send-message --queue-url "$QUEUE_URL" --message-body "{\"runId\":\"rr-test\",\"i\":$i}" | cat
done