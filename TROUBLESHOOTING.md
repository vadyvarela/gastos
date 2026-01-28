# Guia de Solução de Problemas

## Problema: Expo Go não conecta no iPhone

### Soluções:

1. **Usar modo Tunnel (Recomendado)**
   ```bash
   pnpm start:tunnel
   ```
   Isso usa o servidor do Expo para fazer o tunnel, funcionando mesmo com problemas de rede local.

2. **Verificar Firewall do Windows**
   - Abra o Firewall do Windows
   - Permita o Node.js e o Expo através do firewall
   - Ou desative temporariamente o firewall para testar

3. **Verificar se estão na mesma rede**
   - Certifique-se de que o computador e o iPhone estão na mesma rede Wi-Fi
   - Tente desabilitar e reabilitar o Wi-Fi em ambos os dispositivos

4. **Usar o IP correto**
   - No terminal do Expo, procure por algo como:
     ```
     Metro waiting on exp://192.168.x.x:8081
     ```
   - Use esse IP no Expo Go do iPhone

5. **Limpar cache do Expo Go**
   - No iPhone, feche completamente o Expo Go
   - Reabra e tente novamente

6. **Verificar porta 8081**
   - Certifique-se de que a porta 8081 não está bloqueada
   - Tente usar outra porta: `expo start --port 8082`

7. **Usar QR Code**
   - Escaneie o QR code que aparece no terminal
   - Ou use o QR code na interface web do Expo

8. **Alternativa: Usar Expo Dev Client**
   Se o Expo Go continuar com problemas, considere criar um development build:
   ```bash
   npx expo install expo-dev-client
   npx expo prebuild
   ```

## Problema: Erro ESM no metro.config.js

Se ainda aparecer erro de ESM, tente:

1. **Deletar node_modules e reinstalar**
   ```bash
   rm -rf node_modules
   pnpm install
   ```

2. **Limpar cache do Metro**
   ```bash
   npx expo start --clear
   ```

3. **Verificar versão do Node.js**
   ```bash
   node --version
   ```
   Use Node.js 18 ou superior
