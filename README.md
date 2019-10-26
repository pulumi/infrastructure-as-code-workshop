# Infrastructure as Code Workshop

This workshop teaches you Infrastructure as Code concepts through a series of hands-on labs. Topics covered include IaC fundamentals, in addition to application architectures and how to use IaC to create, update, and manage them.

## Course Outline

Before proceeding, ensure your machine is ready to go:

* [Installing Prerequisites](./labs/00-installing-prerequisites.md)

### Lab 1 — Modern Infrastructure as Code

The first lab takes you on a tour of infrastructure as code concepts:

1. [Creating a New Project](./labs/01-iac/01-creating-a-new-project.md)
2. [Configuring AWS](./labs/01-iac/02-configuring-aws.md)
3. [Provisioning Infrastructure](./labs/01-iac/03-provisioning-infrastructure.md)
4. [Updating your Infrastructure](./labs/01-iac/04-updating-your-infrastructure.md)
5. [Making Your Stack Configurable](./labs/01-iac-05-making-your-stack-configurable.md)
6. [Creating a Second Stack](./labs/01-iac-06-creating-a-second-stack.md)
7. [Destroying Your Infrastructure](./labs/01-iac-07-destroying-your-infrastructure.md)

### Lab 2 — Modern Application Architectures

The second lab takes you on a tour of cloud architectures, including VMs, containers, and serverless:

1. [Provisioning EC2 Virtual Machines](./labs/01-app-arch/02-provisioning-a-vm.md)
3. [Deploying Containers to Elastic Container Service (ECS) "Fargate"](./labs/02-app-arch/04-containers-on-ecs.md)
4. [Deploying Containers to a Kubernetes Cluster](./labs/02-app-arch/03-containers-on-kubernetes.md)
5. [Using AWS Lambda for Serverless Application Patterns](./labs/02-app-arch/04-lambda-serverless.md)

## Next Steps

After completing these labs, there are several topics you may want to explore.

* Additional tutorials:
    - [AWS](https://www.pulumi.com/docs/tutorials/aws/)
    - [Azure](https://www.pulumi.com/docs/tutorials/azure/)
    - [GCP](https://www.pulumi.com/docs/tutorials/gcp)
    - [Kubernetes](https://www.pulumi.com/docs/tutorials/kubernetes)
* [Continuous delivery](https://www.pulumi.com/docs/guides/continuous-delivery/)
* [Secrets management](https://www.pulumi.com/blog/managing-secrets-with-pulumi/)
* [Multi-project infrastructure architectures](https://www.pulumi.com/blog/architect-aws-application-infra-with-pulumi-stack-references/)

Thank you for checking out the Infrastructure as Code Workshop! More labs are on their way. Please [file an issue](https://github.com/joeduffy/infrastructure-as-code-workshop/issues/new) if there are topics you'd like to see covered in the future.
