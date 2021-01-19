"""A Python Pulumi program"""

import pulumi

# get the current stack we're in
stack = pulumi.get_stack()

# get the Pulumi organization we're in
org = 'my-org'

# get a stack reference
stack_ref = pulumi.StackReference(f"{org}/stack-1/{stack}")

# retrieve a value from that stack reference
exported_value_from_other_stack = stack_ref.get_output("exported_value")

pulumi.export("exported_value", exported_value_from_other_stack)

