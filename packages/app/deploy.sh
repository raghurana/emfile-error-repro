#!/bin/bash

# Set the directory where the Lambda function zip files are located
SRC_DIR="./src/lambdas"
DIST_DIR="./dist"
PAGER="cat"

# Clean up the dist directory
rm -rf $DIST_DIR
echo "Cleaned up the dist directory"

# Build the Lambda functions
npx esbuild $SRC_DIR/* --entry-names=[dir]/[name]/index \
    --bundle --minify --sourcemap --platform=node --target=es2020  \
    --outdir=$DIST_DIR --external:aws-sdk --external:aws-lambda
    
echo "Built the Lambda functions"

# Zip the Lambda functions
for folder in $DIST_DIR/* ; do
    # Check if the current item in the loop is a directory
    if [ -d "$folder" ]; then
        function_name=$(basename "$folder")
        echo "Zipping $function_name"
        (cd "$folder" && zip -r "../${function_name}.zip" .)
        rm -rf "$folder"
    fi
done
echo "Zipped the Lambda functions"

# Update the Lambda functions
for zip_file in "$DIST_DIR"/*.zip; do
    # Extract the function name from the zip file name (without extension)
    function_name=$(basename "$zip_file" .zip)
    echo "Updating Lambda function: $function_name"
    
    # Use AWS CLI to update the Lambda function code
    aws lambda update-function-code \
        --function-name "$function_name" \
        --zip-file "fileb://$zip_file" \
        --publish
    
    # Check if the update was successful
    if [ $? -eq 0 ]; then
        echo "Successfully updated $function_name"
    else
        echo "Failed to update $function_name"
    fi
    
    echo "----------------------------------------"
done

# echo "All Lambda functions updated successfully."