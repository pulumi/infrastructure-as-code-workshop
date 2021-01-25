# Using Configuration

Now we have a running container, let's modify it to actually use some configuration via Pulumi.

## Add some required configuration

We need to make sure our application actually returns a message, but we probably want to make it configurable. 

First, let's modify our Python application to print something from an environment variable.


