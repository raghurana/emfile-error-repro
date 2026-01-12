QUEUE_URL="https://sqs.ap-southeast-2.amazonaws.com/422540769229/em-file-err-queue"
PAGER="cat"

batch_size=100

for start in $(seq 1 $batch_size 10000); do
  end=$((start + batch_size - 1))
  if [ $end -gt 10000 ]; then end=10000; fi

  for i in $(seq $start $end); do
    aws sqs send-message --queue-url "$QUEUE_URL" --message-body "{\"runId\":\"rr-test\",\"i\":$i}" | cat &
  done

  echo "Processed sequence $start to $end"
  wait  # Waits for all background jobs in this batch to finish
done