import * as pulumi from "@pulumi/pulumi";

// create a new config object
const config = new pulumi.Config();

// optional values can be undefined
const optional_value = config.get("optional_value");

// required values must be set
const required_value = config.require("required_value");

// secret values get encrypted
const secret_value = config.requireSecret("secret_value");

console.log(optional_value)
console.log(required_value)
console.log(secret_value)



