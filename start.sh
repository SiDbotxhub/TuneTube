#!/bin/bash

# Create requirements.txt if not exists
if [ ! -f requirements.txt ]; then
    cat > requirements.txt <<EOL
youtube-search-python==1.6.6
fastapi==0.95.2
uvicorn==0.22.0
httpx==0.24.1
python-multipart==0.0.6
EOL
fi

# Docker installation check
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    newgrp docker
fi

# Docker Compose check
if ! command -v docker-compose &> /dev/null; then
    echo "Installing docker-compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Start services
echo "Starting StreamTube with password-less PostgreSQL..."
docker-compose up -d --build

echo -e "\n\033[1;32mStreamTube is now running!\033[0m"
echo -e "Access at: \033[4mhttp://localhost:3000\033[0m"
echo -e "\nTo stop: \033[1mdocker-compose down\033[0m"
echo -e "To view logs: \033[1mdocker-compose logs -f\033[0m"
