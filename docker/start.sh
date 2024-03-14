#!/bin/bash

set -euo pipefail

uvicorn "$1.startup:create_app" --host 0.0.0.0 --port 80 --factory
