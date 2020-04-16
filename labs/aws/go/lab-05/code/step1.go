package main

import (
	"github.com/pulumi/pulumi-kubernetes/sdk/go/kubernetes/providers"
	"github.com/pulumi/pulumi/sdk/go/pulumi"
	"github.com/pulumi/pulumi/sdk/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		c := config.New(ctx, "")
		stackRef := c.Require("clusterStackRef")
		infra, err := pulumi.NewStackReference(ctx, stackRef, nil)

		kcOutput := infra.GetOutput(pulumi.String("kubeconfig"))
		kubeconfig := kcOutput.ApplyString(func(kc interface{}) string {
			return kc.(string)
		})

		k8sProvider, err := providers.NewProvider(ctx, "k8sprovider", &providers.ProviderArgs{
			Kubeconfig: kubeconfig,
		})
		if err != nil {
			return err
		}

		return nil
	})
}
