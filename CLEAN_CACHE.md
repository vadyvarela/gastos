# Limpar Cache - Comandos

Se ainda houver erros, execute estes comandos na ordem:

```bash
# 1. Limpar cache do Metro e Expo
rm -rf .expo
rm -rf node_modules/.cache

# 2. Limpar node_modules e reinstalar
rm -rf node_modules
pnpm install

# 3. Limpar cache do pnpm
pnpm store prune

# 4. Iniciar com cache limpo
pnpm start
```

**Windows PowerShell:**
```powershell
# 1. Limpar cache
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# 2. Limpar e reinstalar
Remove-Item -Recurse -Force node_modules
pnpm install

# 3. Limpar cache do pnpm
pnpm store prune

# 4. Iniciar
pnpm start
```
