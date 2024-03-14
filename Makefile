#!make

setup:
	@echo "Setting up..."
	@scripts/setup_hooks.sh

docker-up:
	@echo "Building + starting local containers..."
	@sudo docker compose -f ./docker/docker-compose.yaml up --build

docker-down:
	@echo "Stopping local containers..."
	@sudo docker compose -f ./docker/docker-compose.yaml down
