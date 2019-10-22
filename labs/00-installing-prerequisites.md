# Installing Prerequisites

These hands-on labs will walk you through various cloud infrastructure tasks. The prerequisites listed below are required to successfully complete them.

Although Pulumi supports many clouds and many languages, you will use Amazon Web Services (AWS) and TypeScript on Node.js for these labs. Prerequisites are all available on recent versions of macOS, Linux, and Windows.

## AWS

You will need an AWS account. If you don't already have one, you can [sign up for the free tier here](https://portal.aws.amazon.com/billing/signup). The labs have been designed to use the free tier as much as possible, so that the total cost of all resources should be very close to $0. If in doubt, please [go here](https://aws.amazon.com/free) to see what services and resource types are available in the free tier.

At various points, you will use the AWS CLI to interact with infrastructure you've provisioned. Installation instructions are [available here](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html). As explained further on that page, the CLI requires Python.

> If you have multiple AWS accounts, you'll need to configure a profile for the account you're using in these labs. That process is [described here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html). All Pulumi operations will respect your profile settings.

To verify that everything is working, run:

```bash
$ aws sts get-caller-identity
{
    "UserId": "ABDAII73ZGOGZ5V4QSTWY",
    "Account": "161298451113",
    "Arn": "arn:aws:iam::161298451113:user/joe@pulumi.com"
}
```

## Pulumi

You will use Pulumi to depoy infrastructure changes using code. [Install Pulumi here](https://www.pulumi.com/docs/get-started/install/). After installing the CLI, verify that it is working:

```bash
$ pulumi version
v1.3.4
```

The Pulumi CLI will ask you to login to your Pulumi account as needed. If you prefer to signup now, [go to the signup page](http://pulumi.com/signup). Multiple identity provider options are available &mdash; email, GitHub, GitLab, or Atlassian &mdash; and each of them will work equally well for these labs.

## Editor

You may use any editor you'd like for these labs. One that supports TypeScript is recommended. Absent a strong personal preference, Visual Studio Code is an excellent free editor with syntax colorization and statement completion. [Download it here](https://code.visualstudio.com/download).

## Node.js

You will need Node.js version 8 or later to run Pulumi programs written in [TypeScript](https://www.typescriptlang.org/). Install your desired LTS version from [the Node.js download page](https://nodejs.org/en/download/) or [using a package manager](https://nodejs.org/en/download/package-manager/).

After installing, verify that Node.js is working:

```bash
$ node --version
v12.10.0
```

Also verify that the Node Package Manager (NPM) is working:

```bash
$ npm --version
6.10.3
```

## Docker (Optional)

If you will be completing the container labs, [install Docker Community Edition](https://docs.docker.com/install). After doing so, verify that the `docker` CLI is operational:

```bash
$ docker --version
Docker version 19.03.1, build 74b1e89
```

## Kubernetes (Optional)

If you will be completing the Kubernetes labs, [install the kubectl CLI](https://kubernetes.io/docs/tasks/tools/install-kubectl/). It isn't necessary to configure it to speak to a cluster &mdash; you will do that during the appropriate labs that require it.

## Next Steps

* [Infrastructure as Code Basics](./01-basics/01-creating-a-new-project.md)
