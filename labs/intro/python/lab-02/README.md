# Lab 02 - Create a Docker Container

In this lab, we'll create our very first Pulumi resource.

It'll be a simple Python application that runs in a Docker container. We'll run the Docker container we build locally but manage it with Infrastructure as Code using Pulumi.

## Step 2 - Create your application directory

Inside your project directory, create an application directory:

```bash
mkdir app
```

Inside this `app` directory should be two files. First, create a `__main__.py` which will run a very simple Python webserver

```python
import http.server
import socketserver
from http import HTTPStatus


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(HTTPStatus.OK)
        self.end_headers()
        self.wfile.write(b'Hello Lee')


httpd = socketserver.TCPServer(('', 3000), Handler)
httpd.serve_forever()
```

Next, create a `Dockerfile` which will be built and will include this webserver

```
FROM python:3.8.6-alpine

WORKDIR /app

COPY __main__.py /app

CMD [ "python", "/app/__main__.py" ]
```

## Step 3 - Build your Docker Image with Pulumi

Back inside your pulumi program, let's build your Docker image. Inside your `__main__.py` add the following:


```python
import pulumi
from pulumi_docker import Image, DockerBuild

stack = pulumi.get_stack()
image_tag = stack

# build our image!
image = Image("my-first-app",
              build=DockerBuild(context="app"),
              image_name=f"my-first-app:{image_tag}",
              skip_push=True)
```

Make sure you enter your `virtualenv`

```bash
source venv/bin/activate
```

And install the `pulumi_docker` provider:

```
pip3 install pulumi_docker
```

You should see some output showing the pip package and the provider being installed

Run `pulumi up` and it should build your docker image

If you run `docker images` you should see your built container.

## Step 4 - Run the container

Finally, let's run your container. Update your pulumi program to add the following:

```python
import pulumi
from pulumi_docker import Image, DockerBuild, Container, ContainerPortArgs

stack = pulumi.get_stack()
image_tag = stack

# build our image!
image = Image("my-first-app",
              build=DockerBuild(context="app"),
              image_name=f"my-first-app:{image_tag}",
              skip_push=True)

container = Container('my-first-app',
                      image=image.base_image_name,
                      ports=[ContainerPortArgs(
                          internal=3000,
                          external=3000,
                      )])

pulumi.export("container_id", container.id)
```

Re-run your Pulumi program and your container should launch. You can verify this by looking at the docker stats for the running image:

```bash
docker stats $(pulumi stack output container_id) --no-stream
CONTAINER ID   NAME                       CPU %     MEM USAGE / LIMIT     MEM %     NET I/O     BLOCK I/O   PIDS
4b43bf4c92ab   my-first-app-39e5943   0.03%     10.05MiB / 1.941GiB   0.51%     946B / 0B   0B / 0B     1
```
