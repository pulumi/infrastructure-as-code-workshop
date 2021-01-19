import * as pulumi from "@pulumi/pulumi";

// set some config
const config = new pulumi.Config();

// get the current stack we're in as a reference
const stack = pulumi.getStack();

// get our current organization
const org = config.require("org");

// build the stack reference
const stackRef = new pulumi.StackReference(`${org}/stack-1-ts/${stack}`);

export const required_value = stackRef.getOutput('required_value');



