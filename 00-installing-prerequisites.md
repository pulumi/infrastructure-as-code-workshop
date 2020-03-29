# Installing Prerequisites

These hands-on labs will walk you through various cloud infrastructure tasks. The prerequisites listed below are required to successfully complete them.

It is important to understand the prerequisites for the labs you will be working through, e.g, if you are building AWS containers in TypeScript, then you will need to ensure you have

* Pulumi
* NodeJS
* Docker
* AWS Subscription


## Pulumi

You will use Pulumi to depoy infrastructure changes using code. [Install Pulumi here](https://www.pulumi.com/docs/get-started/install/). After installing the CLI, verify that it is working:

```bash
$ pulumi version
v1.9.1
```

The Pulumi CLI will ask you to login to your Pulumi account as needed. If you prefer to signup now, [go to the signup page](http://app.pulumi.com/signup). Multiple identity provider options are available &mdash; email, GitHub, GitLab, or Atlassian &mdash; and each of them will work equally well for these labs.

## Node.js (Required for TypeScript labs)

You will need Node.js version 10 or later to run Pulumi programs written in [TypeScript](https://www.typescriptlang.org/).
Install your desired LTS version from [the Node.js download page](https://nodejs.org/en/download/) or
[using a package manager](https://nodejs.org/en/download/package-manager/).

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

## Python (Required for Python Labs)

To run Pulumi programs written in Python, you need at least Python 3.6. Install your desired version of Python3 from
[the Python download page](https://www.python.org/downloads/). After installing, verify that Python3 is working:

```bash
$ python3 --version
Python 3.7.7
```

You need to also [install Pip3](https://pip.pypa.io/en/stable/installing/). When you have installed pip3, verify that it's
working:

```bash
$ pip3 --version
pip 20.0.2 from /usr/local/lib/python3.7/site-packages/pip (python 3.7)
``` 

## Go (Required for Go Labs)

To run Pulumi programs written in Go, install your desired version of Go from [the Go installation instructions](https://golang.org/doc/install). After
installing, verify that Go is working:

```bash
$ go version
go version go1.14 darwin/amd64
```

You also need to install [go dep](https://github.com/golang/dep#installation). After installing, verify that dep is working:

```bash
$ dep version
dep:
 version     : v0.5.4
 build date  : 2019-09-29
 git hash    : 1f7c19e
 go version  : go1.13
 go compiler : gc
 platform    : darwin/amd64
 features    : ImportDuringSolve=false
```

## .NET Core SDK

Pulumi will need the `dotnet` executable in order to build and run your Pulumi .NET application.

Install .NET Core 3.1 SDK from [here](https://dotnet.microsoft.com/download).

Ensure that the `dotnet` executable can be found on your path after installation.

```bash
$ dotnet --version
3.1.100
```

## Docker (Required for Container based labs)

If you will be completing the container labs, [install Docker Community Edition](https://docs.docker.com/install). After doing so, verify that the `docker` CLI is operational:

```bash
$ docker --version
Docker version 19.03.1, build 74b1e89
```

## Kubernetes (Required only for Kubernetes Labs)

If you will be completing the Kubernetes labs, [install the kubectl CLI](https://kubernetes.io/docs/tasks/tools/install-kubectl/). It isn't necessary to configure it to speak to a cluster &mdash; you will do that during the appropriate labs that require it.

The lab uses EKS which uses IAM for authentication. To support authentication, please also [install aws-iam-authenticator](https://docs.aws.amazon.com/eks/latest/userguide/install-aws-iam-authenticator.html).

## AWS Subscription and CLI (Required for AWS Labs)

If you will be completing the AWS labs, you will need an AWS account. If you don't already have one, you can [sign up for the free tier here](https://portal.aws.amazon.com/billing/signup). 
The labs have been designed to use the free tier as much as possible, so that the total cost of all resources should be very close to $0. 
If in doubt, please [go here](https://aws.amazon.com/free) to see what services and resource types are available in the free tier.

At various points, you will use the AWS CLI to interact with infrastructure you've provisioned. Installation instructions are 
[available here](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html). As explained further on that page, the 
CLI requires Python.

> If you have multiple AWS accounts, you'll need to configure a profile for the account you're using in these labs. That process is 
>[described here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html). All Pulumi operations will respect your profile settings.

To verify that everything is working, run:

```bash
$ aws sts get-caller-identity
{
    "UserId": "ABDAII73ZGOGZ5V4QSTWY",
    "Account": "161298451113",
    "Arn": "arn:aws:iam::161298451113:user/joe@pulumi.com"
}
```

## Azure Subscription and CLI

You need an active Azure subscription to deploy the components of the application. You may use your developer subscription, or create a free Azure subscription [here](https://azure.microsoft.com/free/).

Be sure to clean up the resources after you complete the workshop, as described at the last step of each lab. You will also use the command-line interface (CLI) tool to log in to an Azure subscription. You can install the CLI tool, as described [here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest).

After you complete the installation, open a command prompt and type `az`. You should see the welcome message:

```
$ az
     /\
    /  \    _____   _ _  ___ _
   / /\ \  |_  / | | | \'__/ _\
  / ____ \  / /| |_| | | |  __/
 /_/    \_\/___|\__,_|_|  \___|


Welcome to the cool new Azure CLI!
```
