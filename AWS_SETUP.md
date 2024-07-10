# Setup the AWS for distribution

- S3 will save the files
- Cloudfront will provide HTTPS for sending the files and CDN

## Setup S3 bucket
- Name: acs-widget-actions

- Block all public access (bucket settings)
  - Block all public access: Off
  - Click yellow box - [x] I acknowledge that... 

- Bucket versioning - Disabled
- Tags - None
- Default encryption

- Bucket policy
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::acs-widget-actions/*"
        }
    ]
}
```
- ACL disabled

- CORS file
```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
```

- Directories:
  - acs-widget-actions-staging
  - acs-widget-actions
 
### Github Action Secrets setup
  - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY -> in 1Password or create new IAM user with full access to S3
  - AWS_S3_BUCKET, AWS_S3_REGION -> 'acs-widget-actions', 'eu-central-1'
  - AWS_CF_DISTRIBUTION -> Is the Cloudfront distribution ID

### Cloudfront setup
  - Create new distribution
  - Connect it to our existing bucket as Origin
  - Allow HTTP3 and HTTP with HTTPS
  - All the rest should stay default

