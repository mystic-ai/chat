FROM python:3.10-slim

WORKDIR /app

ENV PIP_NO_CACHE_DIR=1 POETRY_VIRTUALENVS_IN_PROJECT=true

RUN pip install -U pip setuptools

RUN pip install poetry==1.4.2

COPY pyproject.toml poetry.lock ./

ARG INSTALL_DEV=false

RUN apt update -y \
    && apt install -y --no-install-recommends build-essential libpq5 libpq-dev git \
    && rm -rf /var/lib/apt/lists/* \
    && poetry install $(test "$INSTALL_DEV" != true && echo "--only main") --no-interaction --no-ansi --no-root \
    && apt purge -y --auto-remove build-essential libpq-dev

COPY ./src /app/src
COPY ./docker/ /app/docker

COPY README.md .

RUN poetry install --no-interaction

CMD ["poetry", "run", "/app/docker/start.sh", "backend", "--alembic"]
