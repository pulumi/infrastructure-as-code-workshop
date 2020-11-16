import pulumi

# Set up some config
config = pulumi.Config()

# get the current stack we're in
stack = pulumi.get_stack()

# get the Pulumi organization we're in
org = config.require("org")

# get a stack reference
stack_ref = pulumi.StackReference(f"{org}/python-intro/{stack}")

# retrieve a value from that stack reference
required_value_from_other_stack = stack_ref.get_output("required_value")

pulumi.export("required_value", required_value_from_other_stack)

