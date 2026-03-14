#!/bin/sh

# Script de inicialização para produção
echo "Iniciando servidor na porta $PORT (padrão: 3001)"
echo "HOSTNAME: $HOSTNAME (padrão: 0.0.0.0)"

# Exportar variáveis se não estiverem definidas
export PORT=${PORT:-3001}
export HOSTNAME=${HOSTNAME:-0.0.0.0}

echo "Variáveis finais:"
echo "  PORT=$PORT"
echo "  HOSTNAME=$HOSTNAME"

# Iniciar servidor
exec node server.js
