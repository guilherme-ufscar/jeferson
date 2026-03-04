# Locadora - Guia de Instalação e Deploy

## 1. Testar Localmente (sua máquina Windows)

### Pré-requisitos
- **Node.js 20+** instalado
- **PostgreSQL 16** instalado e rodando (ou use Docker só para o banco)
- **Git** (opcional)

### Passo a passo

#### Opção A: PostgreSQL local instalado

```powershell
# 1. Entrar na pasta do projeto
cd locadora

# 2. Instalar dependências
npm install

# 3. Gerar o Prisma Client
npx prisma generate

# 4. Criar o banco e tabelas (PostgreSQL deve estar rodando)
npx prisma migrate dev --name init

# 5. Popular o banco com dados iniciais
npx prisma db seed

# 6. Rodar o projeto
npm run dev
```

Acesse: **http://localhost:3000**

**Logins padrão:**
| Usuário | Email | Senha |
|---------|-------|-------|
| Admin | admin@locadora.com | admin123 |
| Operador | operador@locadora.com | operador123 |

#### Opção B: PostgreSQL via Docker (mais fácil)

Se não quiser instalar o PostgreSQL na máquina, suba só o banco via Docker:

```powershell
# 1. Subir só o PostgreSQL
docker compose up db -d

# 2. Esperar o banco ficar pronto (5 segundos)
Start-Sleep -Seconds 5

# 3. Instalar dependências
npm install

# 4. Gerar o Prisma Client
npx prisma generate

# 5. Criar tabelas
npx prisma migrate dev --name init

# 6. Popular dados iniciais
npx prisma db seed

# 7. Rodar o projeto em modo desenvolvimento
npm run dev
```

#### Opção C: Tudo via Docker (projeto + banco)

```powershell
# 1. Subir tudo (build + banco)
docker compose up --build -d

# 2. Esperar containers ficarem saudáveis
docker compose ps

# 3. Rodar migrations dentro do container
docker compose exec app npx prisma migrate deploy

# 4. Popular dados iniciais
docker compose exec app npx prisma db seed
```

---

## 2. Deploy no Servidor com aaPanel

### Pré-requisitos no servidor
- **aaPanel** instalado
- **Docker** instalado (no aaPanel: App Store → Docker Manager)
- Domínio apontando para o IP do servidor (ex: `locadora.seudominio.com.br`)

### Passo 1: Enviar o projeto para o servidor

No seu PC, compacte a pasta do projeto:

```powershell
# Na pasta Desktop\jeferson
Compress-Archive -Path .\locadora -DestinationPath .\locadora.zip
```

Envie o `locadora.zip` para o servidor via **aaPanel → Arquivos** (upload para `/www/wwwroot/`).

No terminal do servidor (SSH ou aaPanel Terminal):

```bash
cd /www/wwwroot/
unzip locadora.zip
cd locadora
```

### Passo 2: Configurar variáveis de ambiente

Crie o arquivo `.env.production` no servidor:

```bash
cat > .env.production << 'EOF'
DB_PASSWORD=SuaSenhaSegura123!
NEXTAUTH_SECRET=chave-secreta-muito-longa-e-aleatoria-para-producao
NEXTAUTH_URL=https://locadora.seudominio.com.br
APP_PORT=3000
EOF
```

> **IMPORTANTE:** Troque `DB_PASSWORD`, `NEXTAUTH_SECRET` e `NEXTAUTH_URL` por valores reais!

Para gerar uma chave segura:
```bash
openssl rand -base64 32
```

### Passo 3: Subir com Docker Compose

```bash
cd /www/wwwroot/locadora

# Carregar variáveis e subir
docker compose --env-file .env.production up --build -d

# Verificar se os containers estão rodando
docker compose ps

# Aguardar o banco ficar saudável, depois rodar migrations
docker compose exec app npx prisma migrate deploy

# Popular dados iniciais (só na primeira vez!)
docker compose exec app npx prisma db seed
```

### Passo 4: Configurar Reverse Proxy no aaPanel

1. No aaPanel, vá em **Website → Add Site**
2. Coloque o domínio: `locadora.seudominio.com.br`
3. PHP Version: **Static** (não precisa de PHP)
4. Após criar, clique no site → **Reverse Proxy → Add Reverse Proxy**:
   - **Proxy Name**: `locadora`
   - **Target URL**: `http://127.0.0.1:3000`
   - **Send Domain**: `$host`
5. Salve

### Passo 5: SSL (HTTPS)

1. No aaPanel, clique no site → **SSL**
2. Selecione **Let's Encrypt**
3. Marque o domínio e clique em **Apply**
4. Ative **Force HTTPS**

### Passo 6: Verificar

Acesse `https://locadora.seudominio.com.br` e faça login com:
- **Email:** admin@locadora.com
- **Senha:** admin123

> **Troque a senha do admin imediatamente após o primeiro login!**

---

## Comandos Úteis

```bash
# Ver logs do app
docker compose logs app -f

# Ver logs do banco
docker compose logs db -f

# Reiniciar tudo
docker compose restart

# Parar tudo
docker compose down

# Parar e APAGAR dados (cuidado!)
docker compose down -v

# Reconstruir após mudanças no código
docker compose up --build -d

# Acessar o banco de dados
docker compose exec db psql -U postgres -d locadora

# Backup do banco
docker compose exec db pg_dump -U postgres locadora > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker compose exec -T db psql -U postgres locadora < backup_20260304.sql
```

---

## Estrutura de Portas

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| App (Next.js) | 3000 | Aplicação web |
| PostgreSQL | 5432 | Banco de dados |

> No servidor de produção, a porta 5432 **não deve ser exposta** externamente. Edite o `docker-compose.yml` e remova a seção `ports` do serviço `db` para segurança.

---

## Solução de Problemas

| Problema | Solução |
|----------|---------|
| Banco não conecta | Verifique se o container `db` está rodando: `docker compose ps` |
| Erro de migration | Rode: `docker compose exec app npx prisma migrate deploy` |
| Porta 3000 em uso | Mude `APP_PORT=3001` no `.env.production` |
| Uploads não salvam | Verifique permissões: `docker compose exec app ls -la uploads/` |
| Container reiniciando | Veja logs: `docker compose logs app --tail 50` |
