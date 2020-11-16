import pulumi

config = pulumi.Config()

# optional values can be undefined, they return `None` if nothing is set
optional_value = config.get('value')

# required values must be set
required_value = config.require('required_value')

# secret values get encrypted
secret_value = config.require_secret('secret_value');

print(optional_value)
print(required_value)
print(secret_value)
