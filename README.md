# This repo is being deprecated in favor of https://github.com/pulumi/workshops.
![deprecated](https://img.shields.io/badge/repo%20status-deprecated-red)

The workshops in this repo have been moved over to that repo and placed in the archive as newer workshops based off these workshops have been generated.

# Infrastructure as Code Workshops

This repo contains workshops for getting started with Pulumi through a series of hands-on labs. The workshops are organized by cloud provider and then separated into language specific workshops.

## Introductory Workshop

The [introductory workshop](./labs/intro) is designed to guide you through some Pulumi fundamentals. It has a related GitHub repo with a pre-built development environment [here](https://github.com/pulumi/introduction-to-pulumi).

## AWS Workshops

The AWS workshops are designed to guide you through examples of interacting with AWS using Pulumi. You can find more AWS workshops at the [AWS Workshops](https://pulumi.awsworkshop.io/) page.

### Prerequisities

If you want to follow along at home, you'll need to install some dependencies on your local machine.

* [Installing Prerequisites](./00-installing-prerequisites.md)

## In Person Workshop Outline

The following is an overview of the in-person workshops and their current status:

|            | TypeScript            | Python                   | Go                       | C#                       | 
| ------     | -------               | -------                  | -------                  | -------                  |
| AWS        |   [Get started][1]    |   [Get started][2]       |   [Get started][4]       |   [Get started][5]       |
| Azure      |   Coming soon         |   [Get started][6]           |   Coming soon            |   [Get started][3]       |
| GCP        |   Coming Soon         |   Coming soon            |   Coming soon            |   Coming soon            |

## Next Steps

After completing these labs, there are several topics you may want to explore.

* [Continuous delivery](https://www.pulumi.com/docs/guides/continuous-delivery/)
* [Secrets management](https://www.pulumi.com/blog/managing-secrets-with-pulumi/)
* [Multi-project infrastructure architectures](https://www.pulumi.com/blog/architect-aws-application-infra-with-pulumi-stack-references/)
* [Test-driven infrastructure](https://www.pulumi.com/blog/unit-testing-infrastructure-in-nodejs-and-mocha/)

Thank you for checking out the Infrastructure as Code Workshop! More labs are on their way. Please [file an issue](https://github.com/pulumi/infrastructure-as-code-workshop/issues/new) if there are topics you'd like to see covered in the future.

[1]: ./labs/aws/in-person/typescript/README.md
[2]: ./labs/aws/in-person/python/README.md
[3]: ./labs/azure/csharp/README.md
[4]: ./labs/aws/in-person/go/README.md
[5]: ./labs/aws/in-person/csharp/README.md
[6]: ./labs/azure/python/README.md
