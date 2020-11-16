import pulumi

config = pulumi.Config()

# optional values can be undefined, they return `None` if nothing is set
optional_value = config.get('value')

# required values must be set
required_value = config.require('required_value')

# secret values get encrypted
secret_value = config.require_secret('secret_value');

pulumi.export('value', optional_value)
pulumi.export('required_value', required_value)
pulumi.export('secret_value', secret_value)
