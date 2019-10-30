import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as path from "path";

const myBucket = new aws.s3.Bucket("my-bucket");

const myObject = new aws.s3.BucketObject("index.html", {
    bucket: myBucket,
    source: path.join("site", "index.html"),
});

export const bucketName = myBucket.bucket;
