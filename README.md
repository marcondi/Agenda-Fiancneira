# Aplicativo de Controle Financeiro

Sistema completo de controle financeiro pessoal com autenticação, gerenciamento de transações, agendamento de contas e dicas de IA.

## Funcionalidades

- **Autenticação**
  - Login e cadastro de usuários
  - Modo convidado
  - Persistência de dados no localStorage
  - Logout seguro

- **Dashboard**
  - Visualização de entradas, saídas e saldo
  - Navegação entre meses
  - Gráfico de pizza mostrando despesas por categoria
  - Notificações de contas próximas ao vencimento

- **Gerenciamento de Lançamentos**
  - Adicionar receitas e despesas
  - Categorização personalizável
  - Lançamentos recorrentes (mensal)
  - Editar e excluir transações
  - Busca por descrição ou categoria

- **Agenda de Contas**
  - Agendar contas recorrentes
  - Definir dia de vencimento
  - Marcar como pago
  - Visualização mensal
  - Notificações de vencimento (5 dias)

- **Categorias**
  - Categorias pré-definidas
  - Criar categorias personalizadas
  - Editar e excluir categorias
  - Separação por tipo (receita/despesa)

- **Recursos Extras**
  - Dicas financeiras com IA (Google Gemini)
  - Tema claro/escuro
  - Exportar/importar dados (backup)
  - Design responsivo
  - Interface moderna e intuitiva

## Instalação

### Pré-requisitos
- Node.js 16+ instalado
- NPM ou Yarn

### Passos

1. Navegue até a pasta do projeto:
```bash
cd finance-app
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra o navegador em `http://localhost:5173`

## Como Usar

### Primeiro Acesso
1. Faça login como convidado ou crie uma conta
2. O sistema já vem com categorias pré-definidas
3. Comece adicionando seus lançamentos

### Adicionar Lançamento
1. Clique no botão flutuante "Adicionar Lançamento"
2. Escolha o tipo (Receita ou Despesa)
3. Preencha valor, descrição, categoria e data
4. Marque como recorrente se necessário
5. Clique em "Adicionar"

### Agendar Conta
1. Vá para a aba "Agenda"
2. Clique em "Agendar Conta"
3. Preencha os dados da conta
4. Defina o dia de vencimento
5. Escolha por quantos meses repetir

### Gerenciar Categorias
1. Clique no ícone de engrenagem no header
2. Adicione, edite ou exclua categorias
3. Separe por tipo (receita/despesa)

### Exportar/Importar Dados
- **Exportar**: Clique no ícone de download no header
- **Importar**: Clique no ícone de upload e selecione o arquivo JSON

### Tema Escuro
- Clique no ícone de lua/sol no header para alternar

## Tecnologias Utilizadas

- React 18
- TypeScript
- Vite
- TailwindCSS
- Recharts (gráficos)
- Lucide React (ícones)
- Google Gemini API (dicas de IA)

## Estrutura do Projeto

```
finance-app/
├── src/
│   ├── components/        # Componentes React
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── TransactionModal.tsx
│   │   ├── TransactionList.tsx
│   │   ├── ScheduleModal.tsx
│   │   ├── ScheduleList.tsx
│   │   ├── CategoryModal.tsx
│   │   ├── ExpenseChart.tsx
│   │   └── AITips.tsx
│   ├── contexts/          # Contextos React
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── types/             # Tipos TypeScript
│   │   └── index.ts
│   ├── utils/             # Utilitários
│   │   └── storage.ts
│   ├── App.tsx            # Componente principal
│   ├── main.tsx           # Entry point
│   └── index.css          # Estilos globais
├── public/                # Arquivos públicos
├── index.html             # HTML principal
├── package.json           # Dependências
├── tsconfig.json          # Config TypeScript
├── vite.config.ts         # Config Vite
└── tailwind.config.js     # Config Tailwind
```

## Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`.

## Suporte

Para dúvidas ou problemas, crie uma issue no repositório.

## Licença

MIT
