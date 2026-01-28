# Limpar Cache - Instruções

O erro de `react-native-css-interop/jsx-runtime` é causado por cache antigo. Execute estes comandos:

## Windows PowerShell

```powershell
# 1. Limpar cache do Expo e Metro
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# 2. Limpar cache do Babel
Remove-Item -Recurse -Force node_modules\.babel-cache -ErrorAction SilentlyContinue

# 3. Limpar watchman (se instalado)
watchman watch-del-all

# 4. Reinstalar dependências
pnpm install

# 5. Iniciar com cache limpo
pnpm start
```

## Alternativa: Limpar tudo

```powershell
# Limpar tudo e reinstalar
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item pnpm-lock.yaml -ErrorAction SilentlyContinue
pnpm install
pnpm start
```
