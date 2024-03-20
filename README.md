# chat

Open source multi modal chat interface

To run this project you will need docker installed on your machine, and preferabbly a local GPU to run the main llm model.

To run the project, first clone the repository and then run the following command:

```shall
make docker-up
```

This will build all containers and spin up the frontend, backend, and LLM. You can navigate to `localhost:13000` in your browser to get started.
