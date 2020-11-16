import * as pulumi from "@pulumi/pulumi";

// create a new config object
const config = new pulumi.Config();

// optional values can be undefined
const optional_value = config.get("optional_value");

// this is now an exported value
export const required_value = config.require("required_value");

// secret values get encrypted
const secret_value = config.requireSecret("secret_value");




