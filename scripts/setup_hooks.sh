#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

G='\033[0;32m'
Y='\033[1;33m'
NC='\033[0m'

printf "${Y}Setting Pre-Push hooks...${NC}\n"
cat > .git/hooks/pre-push <<- "EOF"
#!/bin/bash
poetry run pytest tests/
EOF

chmod +x .git/hooks/pre-push
printf "${G}Pre-Push hooks set.${NC}\n"

printf "${Y}Installing deps...${NC}\n"
poetry install
printf "${G}Dependencies installed.${NC}\n"
printf "${Y}Setting Pre-Commit hooks...${NC}\n"
poetry run pre-commit install

poetry run pre-commit autoupdate
printf "${G}Pre-Commit hooks set.${NC}\n"
