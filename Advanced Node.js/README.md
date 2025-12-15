# Advanced Node.js - Streams, Clusters e Child Processes

Aplicação integrada demonstrando conceitos avançados de Node.js: Streams, Clusters e Child Processes trabalhando em conjunto.

## 1. Ferramentas e Tecnologias Utilizadas

**Conceitos Demonstrados:**
- **Runtime:** Node.js 16+ com ES Modules
- **Streams:** Processamento incremental de dados (Readable, Writable, Transform)
- **Clusters:** Escalamento horizontal através de múltiplos workers
- **Child Processes:** Execução de tarefas CPU-intensivas em processos separados

**Funcionalidades:**
- Servidor HTTP clusterizado (um worker por núcleo de CPU)
- Upload de ficheiros via streams com transformações
- Processamento CPU-intensivo via processos filhos
- Comunicação IPC entre master e workers
- Encerramento gracioso de processos

## 2. Requisitos para Execução

**Pré-requisitos:**
- Node.js 16.0.0 ou superior

Comandos:
npm start


**URLs Disponíveis:**
- Servidor: http://localhost:3000
- Health Check: http://localhost:3000/
- Upload: http://localhost:3000/upload
- Processamento: http://localhost:3000/process
- Estatísticas: http://localhost:3000/stats

## 3. Estrutura do Projeto

```
advanced-nodejs-app/
├── src/
│   ├── server.js              # Processo master do cluster
│   ├── worker.js              # Servidor HTTP worker
│   │
│   ├── streams/
│   │   ├── fileStream.js      # Utilitários de streaming de ficheiros
│   │   ├── transformStream.js # Streams de transformação (uppercase, contador)
│   │   └── streamHandler.js   # Orquestração de pipelines
│   │
│   ├── processes/
│   │   ├── computeWorker.js   # Worker de computação CPU-intensiva
│   │   ├── processManager.js  # Gestor de pool de processos
│   │   └── tasks/
│   │       ├── dataProcessor.js   # Tarefas de processamento
│   │       └── compressionTask.js # Tarefas de compressão
│   │
│   ├── routes/
│   │   ├── upload.js          # Rotas de upload (streams)
│   │   ├── process.js         # Rotas de processamento (child processes)
│   │   └── stream.js          # Rotas de streaming
│   │
│   └── utils/
│       ├── logger.js           # Utilitário de logging
│       └── gracefulShutdown.js # Encerramento gracioso
│
├── data/
│   └── uploads/                # Diretório de ficheiros carregados
│
├── package.json
└── README.md
```

## 4. Endpoints da API

**Health Check:**
- `GET /` ou `GET /health` - Estado do servidor e worker

**Upload (Streams):**
- `POST /upload` - Upload de ficheiro (guarda como `upload_n.txt`)
- `POST /upload?transform=uppercase` - Upload com transformação para maiúsculas
- `POST /upload?transform=count` - Upload com contagem de linhas

**Processamento (Child Processes):**
- `GET /process?task=heavyComputation&n=10000000` - Computação pesada
- `GET /process?task=generatePrimes&limit=1000` - Gerar números primos
- `GET /process?task=processArray&size=1000` - Processar array
- `GET /process/parallel?count=4&n=5000000` - Processamento paralelo
- `GET /process/stats` - Estatísticas do pool de processos

**Streaming:**
- `GET /stream?file=upload_n.txt` - Stream de ficheiro (com compressão gzip opcional)
- `GET /stream/generated?lines=1000` - Stream gerado dinamicamente

**Estatísticas:**
- `GET /stats` - Estatísticas do worker (pedidos, memória, uptime)

## 5. Funcionalidades Principais

**Clusters:**
- Master process gere múltiplos workers (um por núcleo CPU)
- Load balancing automático de pedidos
- Reinício automático de workers em caso de falha
- Comunicação IPC entre master e workers

**Streams:**
- Upload de ficheiros sem carregar tudo em memória
- Transform streams (uppercase, contador de linhas)
- Streaming de respostas HTTP
- Compressão gzip automática
- Backpressure automático

**Child Processes:**
- Pool de workers para tarefas CPU-intensivas
- Execução paralela de múltiplas tarefas
- Comunicação via IPC
- Gestão de fila de tarefas

**Encerramento Gracioso:**
- Para de aceitar novos pedidos
- Espera que pedidos ativos terminem
- Desconecta workers limpa
- Encerra processos sem erros


## 6. Testes

Execute o script de teste:
.\testing.ps1

O script testa:
- Health check do servidor
- Clustering (distribuição de pedidos)
- Upload de ficheiros
- Transformações de streams
- Processamento CPU
- Estatísticas

## 8. Conceitos Demonstrados

**Streams:**
- Processamento incremental de dados
- Evita carregar ficheiros grandes em memória
- Transformações em tempo real
- Backpressure automático

**Clusters:**
- Utilização de múltiplos núcleos de CPU
- Escalamento horizontal
- Isolamento de falhas
- Load balancing

**Child Processes:**
- Execução de tarefas CPU-intensivas sem bloquear event loop
- Comunicação entre processos via IPC
- Pool de workers para paralelização
- Gestão de fila de tarefas

## 9. Notas Técnicas

- Ficheiros de upload são nomeados sequencialmente: `upload_1.txt`, `upload_2.txt`, etc.
- O servidor cria automaticamente um worker por núcleo de CPU
- Processos filhos são geridos num pool para evitar sobrecarga

## 10. Limitações e Melhorias Futuras

**Limitações:**
- Numeração sequencial de uploads pode ter condições de corrida em alta concorrência
- Pool de processos filhos é fixo (4 workers)
- Não há persistência de dados entre reinícios

**Melhorias Futuras:**
- Base de dados para metadados de uploads
- Sistema de filas (Redis/RabbitMQ) para tarefas
- Rate limiting
- Autenticação e autorização

## Licença
GNU v3.0