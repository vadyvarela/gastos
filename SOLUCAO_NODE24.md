# Solução para Erro ESM com Node.js 24

## Problema
Node.js 24 está tentando carregar `metro.config.js` como ESM, causando erro:
```
Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Error loading Metro config
```

## Soluções

### Solução 1: Usar Node.js 20 (Recomendado)
```bash
# Com nvm
nvm install 20
nvm use 20
pnpm start
```

### Solução 2: Usar variável de ambiente
```bash
# Windows PowerShell
$env:NODE_OPTIONS="--loader ./metro-loader.cjs"; pnpm start

# Windows CMD
set NODE_OPTIONS=--loader ./metro-loader.cjs && pnpm start

# Linux/Mac
NODE_OPTIONS="--loader ./metro-loader.cjs" pnpm start
```

### Solução 3: Renomear para .cjs e criar symlink
```bash
# Renomear
mv metro.config.js metro.config.cjs

# Criar symlink (Windows precisa de permissões de admin)
# No PowerShell como Admin:
New-Item -ItemType SymbolicLink -Path metro.config.js -Target metro.config.cjs
```

### Solução 4: Usar Expo sem Metro config customizado
Remova o `metro.config.js` temporariamente e use apenas Babel para NativeWind.

### Solução 5: Downgrade do Node.js
Se possível, use Node.js 20 LTS que é mais estável com Expo:
```bash
nvm install 20.18.0
nvm use 20.18.0
```

## Verificação
```bash
node --version  # Deve ser 20.x.x
```
