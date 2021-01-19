# # Lab 04 - Stack References

In this lab, we'll examine how stack references work, and how they can be used to pass outputs to other stacks.

## Step 1 - Create a second stack

In a new directory, create a second stack called `use-docker-id`

```bash
mkdir use-docker-id
pulumi new python
```

Use the defaults, and ensure you use the `dev` stack.

## Step 3 - Configure your stack reference

Now we need to add a stack reference in stack-2


```python
import pulumi

stack = pulumi.get_stack()

# get the Pulumi organization we're in
# FIXME: this needs to be set to your Pulumi login
org = 'my-org'

# get a stack reference
stack_ref = pulumi.StackReference(f"{org}/pulumi-docker/{stack}")

# retrieve a value from that stack reference
exported_value_from_other_stack = stack_ref.get_output("container_id")

pulumi.export("container_id", exported_value_from_other_stack)
```

Run `pulumi up`. You'll see the value gets exported from this stack now too.

These exported values are incredibly useful when using Pulumi stacks
