# Gasto - Aplicação de Gestão de Gastos Pessoais

Aplicação mobile desenvolvida com React Native + Expo para gerenciamento de gastos pessoais com suporte offline-first e sincronização com Turso (LibSQL).

## 🚀 Stack Tecnológica

- **Framework**: React Native + Expo
- **Database**: Turso (LibSQL) + SQLite local (expo-sqlite)
- **Linguagem**: TypeScript
- **State Management**: Zustand
- **Navegação**: Expo Router
- **Estilização**: StyleSheet (React Native padrão)
- **Validação**: Zod + React Hook Form
- **Listas**: FlashList (@shopify/flash-list)

## 📋 Funcionalidades

- ✅ CRUD completo de gastos (valor, categoria, data, descrição)
- ✅ Categorias predefinidas e customizáveis
- ✅ Listagem com filtros (mês, categoria)
- ✅ Resumo mensal (total, por categoria)
- ✅ Modo offline-first (sync quando online)
- ✅ Sincronização automática com Turso

## 🛠️ Instalação

### Pré-requisitos

- Node.js 18+
- pnpm (gerenciador de pacotes)
- Expo CLI (`pnpm add -g expo-cli`)

### Passos

1. Clone o repositório:
```bash
git clone <repository-url>
cd gasto
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais do Turso:
```
EXPO_PUBLIC_TURSO_URL=your-turso-database-url
EXPO_PUBLIC_TURSO_AUTH_TOKEN=your-turso-auth-token
```

4. Inicie o servidor de desenvolvimento:
```bash
pnpm start
```

## 📱 Executando a Aplicação

- **iOS**: `pnpm ios` ou pressione `i` no terminal do Expo
- **Android**: `pnpm android` ou pressione `a` no terminal do Expo
- **Web**: `pnpm web` ou pressione `w` no terminal do Expo

## 📁 Estrutura do Projeto

```
/app              # Rotas (Expo Router)
  /(tabs)         # Telas com tabs
    index.tsx     # Home - Lista de gastos
    summary.tsx   # Resumo mensal
    categories.tsx # Gerenciamento de categorias
  add-expense.tsx # Adicionar gasto
  expense/[id].tsx # Detalhes do gasto

/components        # Componentes reutilizáveis
  /expense        # Componentes de gastos
  /category       # Componentes de categorias
  /filters        # Componentes de filtros
  /summary        # Componentes de resumo
  /ui             # Componentes UI básicos

/lib              # Configurações e utilitários
  /db            # Schema e migrations
  /types         # Tipos TypeScript
  turso.ts       # Cliente Turso
  sqlite.ts      # Cliente SQLite local

/stores           # Estado global (Zustand)
  expenseStore.ts
  categoryStore.ts
  syncStore.ts

/hooks            # Custom hooks
  useExpenses.ts
  useCategories.ts
  useSync.ts
  ...

/utils            # Funções utilitárias
  currency.ts
  date.ts
  validation.ts
  database.ts
```

## 🔧 Configuração do Turso

1. **Instale o Turso CLI** (se ainda não tiver):
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```

2. **Autentique-se no Turso**:
   ```bash
   turso auth login
   ```

3. **Crie um banco de dados**:
   ```bash
   turso db create gasto-db
   ```

4. **Obtenha a URL HTTP do banco**:
   ```bash
   turso db show gasto-db --http-url
   ```
   Copie a URL (formato: `libsql://xxx-xxx.turso.io`)

5. **Crie um token de autenticação**:
   ```bash
   turso db tokens create gasto-db
   ```
   Copie o token gerado

6. **Configure o arquivo `.env`**:
   ```bash
   cp .env.example .env
   ```
   
   Edite o `.env` e adicione:
   ```
   EXPO_PUBLIC_TURSO_URL=libsql://seu-database-sua-org.turso.io
   EXPO_PUBLIC_TURSO_AUTH_TOKEN=seu-token-aqui
   ```

**Nota**: A aplicação funciona completamente offline usando SQLite local. A sincronização com Turso é opcional e acontece automaticamente quando há conexão e as credenciais estão configuradas.

## 📝 Migrations

As migrations são executadas automaticamente na primeira inicialização do app. Elas criam:

- Tabela `expenses`: Armazena os gastos
- Tabela `categories`: Armazena as categorias
- Tabela `sync_queue`: Fila de sincronização offline

Categorias padrão são criadas automaticamente:
- Alimentação
- Transporte
- Compras
- Contas
- Entretenimento
- Saúde
- Educação
- Outros

## 🔄 Sincronização Offline-First

A aplicação implementa uma estratégia offline-first:

1. Todas as operações CRUD são salvas primeiro no SQLite local
2. Quando offline, as operações são adicionadas à fila de sincronização
3. Quando online, a sincronização acontece automaticamente
4. Indicadores visuais mostram o status de sincronização

## 🎨 Estilização

A aplicação usa StyleSheet do React Native para estilização. Os componentes são estilizados usando a prop `style` com objetos StyleSheet.

Exemplo:
```tsx
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
  },
  text: {
    color: '#111827',
    fontSize: 16,
  },
});

<View style={styles.container}>
  <Text style={styles.text}>Texto</Text>
</View>
```

A aplicação suporta dark mode automaticamente através do hook `useColorScheme()`.

## 🧪 Desenvolvimento

### Scripts Disponíveis

- `pnpm start`: Inicia o servidor de desenvolvimento
- `pnpm android`: Executa no Android
- `pnpm ios`: Executa no iOS
- `pnpm web`: Executa no navegador
- `pnpm lint`: Executa o linter

### Padrões de Código

- **Componentes**: Funcionais com TypeScript
- **Nomenclatura**: PascalCase para componentes, camelCase para funções
- **Imports**: Organizados (React → bibliotecas → locais)
- **Types**: Interfaces definidas para todos os dados
- **Async/Await**: Usado para operações de banco de dados

## 📦 Dependências Principais

- `expo`: Framework React Native
- `expo-router`: Roteamento baseado em arquivos
- `expo-sqlite`: Banco de dados local
- `@libsql/client`: Cliente Turso
- `zustand`: Gerenciamento de estado
- `zod`: Validação de schemas
- `react-hook-form`: Gerenciamento de formulários
- `@shopify/flash-list`: Listas otimizadas

## 🔒 Segurança

- Credenciais do Turso nunca são expostas no código
- Variáveis de ambiente são usadas para configuração
- Validação de inputs com Zod antes de salvar
- Prepared statements para prevenir SQL injection
- Sanitização de dados exibidos

## 📄 Licença

Este projeto é privado.

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões e melhorias são bem-vindas!
