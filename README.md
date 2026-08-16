# 🍽️ allmoço UFCG — Guia e Cardápio Gastronômico Universitário

<p align="center">
  <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80" alt="allmoço UFCG Banner" width="100%" style="border-radius: 12px; max-height: 380px; object-fit: cover;" />
</p>

<p align="center">
  <strong>Guia completo de gastronomia universitária para estudantes, servidores e visitantes da Universidade Federal de Campina Grande (Campus Bodocongó - UFCG).</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Google_Gemini-IA_Nutricional-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
</p>

---

## 📌 Sobre o Projeto

O **allmoço UFCG** é uma plataforma *Progressive Web App* (PWA) desenvolvida para transformar a experiência gastronômica no campus universitário. O app centraliza os cardápios em tempo real dos restaurantes, lanchonetes e marmitarias do campus e do entorno (Bodocongó, Anel Universitário e Praça de Convivência), fornecendo estimativas de gastos, mapas interativos, avaliações de estudantes e cálculo nutricional com Inteligência Artificial.

---

## ✨ Funcionalidades Principais

### 🔍 1. Busca e Filtros Inteligentes
- **Status em Tempo Real:** Verificação instantânea de restaurantes *"Aberto Agora"* ou *"Fechado"* de acordo com o horário local.
- **Filtros Nutricionais e Restrições Alimentares:**
  - 🌱 **Vegano (VG)**
  - 🌾 **Sem Glúten (SG)**
  - 🥛 **Sem Lactose (SL)**
- **Desconto Universitário:** Destaque de locais com promoções ou descontos especiais com apresentação da carteirinha de estudante.
- **Destaque do "Prato do Dia":** Exibição de opções especiais diárias cadastradas pelos estabelecimentos.
- **Filtro de Preço e Ordenação:** Faixa de preço mínimo/máximo e ordenação por melhor avaliação ou número de pratos.

### 🗺️ 2. Mapa Interativo do Campus (UFCG)
- Visualização de satélite/vetorial com marcação precisa dos pontos de alimentação em setores estratégicos (Anel Universitário, Praça da Alimentação, Centro de Convivência).
- Cálculo rápido de localização com atalho direto para navegação no **Google Maps**.

### 🤖 3. Inteligência Nutricional com Google Gemini (IA)
- Estimativa instantânea de calorias (**kcal**), proteínas (**g**), carboidratos (**g**), gorduras (**g**) e fibras (**g**) a partir do nome do prato e da porção em gramas.
- **Fallback Heurístico Offline/Resiliente:** Integração baseada na Tabela Brasileira de Composição de Alimentos (TACO) caso a conexão com a IA esteja instável.
- Resumo técnico simplificado com dicas de alimentação balanceada para estudantes.

### 💰 4. Simulador de Gastos & Comparativo com o RU
- **Planejador Semanal:** Monte sua rotina de refeições selecionando pratos e frequência de consumo durante a semana.
- **Métricas Financeiras:** Total semanal estimado, média diária e projeção de custo mensal.
- **Comparador com Restaurante Universitário (RU):** Cálculo automático do valor economizado ou investido em relação à tarifa padrão de estudante.

### 📊 5. Avaliações com Gráficos Interativos (Recharts)
- Avaliação por estrelas (1 a 5) e resenhas descritivas de estudantes autenticados via **Google Sign-In**.
- Gráfico de distribuição de avaliações em tempo real construído com **Recharts**.

### 📲 6. Gerador de QR Code e Deep Linking
- **QR Code Instantâneo por Restaurante:** Geração de códigos QR dinâmicos em alta resolução com o logo e identidade visual do allmoço.
- **Deep Linking Nativo:** Ao apontar a câmera do celular para o QR Code, qualquer estudante ou visitante abre instantaneamente a página e cardápio daquele restaurante específico (`?restaurant=ID`).
- **Exportação & Mesa Universitária:** Download do QR Code em imagem de alta definição (PNG) com moldura personalizada e suporte a impressão para displays de mesa nas lanchonetes e refeitórios do campus.
- **Compartilhamento Web Share:** Atalhos para WhatsApp, Telegram e redes sociais com um clique.

### 🏪 7. Gestão e Cadastro para Estabelecimentos
- Área dedicada para proprietários cadastrarem novos restaurantes ou atualizarem preços, horários de funcionamento e pratos do dia.
- Controle de permissão: apenas o criador do restaurante ou administradores podem editar/excluir dados.

### 📶 8. Offline First & PWA (Service Worker)
- Aplicativo instalável no celular ou desktop (PWA).
- Service Worker customizado com cache inteligente de dados e fotos, permitindo consulta aos cardápios mesmo em momentos de queda de sinal no campus.

---

## 🛡️ Arquitetura e Segurança

A aplicação foi projetada seguindo padrões rígidos de segurança (*Security by Design*):

- **Zero-Trust Firestore Rules:** Controle de acesso baseado em atributos (ABAC) no Firestore — leitura pública para consulta e escrita restrita com validação de `ownerId == request.auth.uid`.
- **Proteção Backend Express:**
  - **Rate Limiting (`express-rate-limit`):** Protege os endpoints de IA contra sobrecarga de requisições e consumo abusivo de cotas.
  - **Headers de Segurança (`helmet`):** Inclusão de `X-Content-Type-Options: nosniff`, mitigação de Clickjacking e remoção do fingerprint `X-Powered-By`.
  - **Payload Throttling:** Limite estrito de tamanho no corpo das requisições (`100kb`).
- **Prevenção contra XSS e Injeção de Links:** Sanitização rigorosa de URLs para bloquear esquemas maliciosos (`javascript:`, `data:`).
- **Tratamento Seguro de Erros:** Ocultação de stack traces ou detalhes técnicos de infraestrutura em respostas ao cliente.

---

## 🛠️ Tecnologias

| Camada | Ferramentas |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4 |
| **Animações & UI** | Motion (`motion/react`), Lucide React |
| **Visualização de Dados** | Recharts |
| **Servidor & APIs** | Node.js, Express, Google GenAI SDK (`@google/genai`) |
| **Banco de Dados & Auth** | Firebase Firestore, Firebase Authentication (Google) |
| **Segurança** | Helmet, Express Rate Limit, Firestore Security Rules |
| **Cache & Offline** | Service Worker PWA, Cache Storage API |

---

## 📁 Estrutura de Diretórios

```
├── public/
│   ├── sw.js                 # Service Worker (Cache offline e PWA)
│   └── manifest.json         # Manifesto PWA
├── src/
│   ├── components/           # Componentes modulares de UI
│   │   ├── Badges.tsx        # Selos de status, desconto e restrição alimentar
│   │   ├── CampusMap.tsx     # Mapa interativo com marcadores
│   │   ├── NutritionModal.tsx# Calculadora nutricional com Gemini AI
│   │   ├── RatingDistributionChart.tsx # Gráfico Recharts de notas
│   │   ├── RestaurantCard.tsx# Card com resumo do restaurante
│   │   ├── RestaurantForm.tsx# Formulário de cadastro/edição
│   │   ├── RestaurantModal.tsx # Detalhes completos do cardápio
│   │   ├── ReviewSection.tsx # Lista e formulário de avaliações
│   │   └── SpendingModal.tsx # Simulador de gastos e comparativo com o RU
│   ├── lib/
│   │   └── firebase.ts       # Inicialização do Firebase Auth & Firestore
│   ├── utils/
│   │   ├── nutrition.ts      # Integração com API de nutrição
│   │   ├── rating.ts         # Cálculo estatístico de avaliações
│   │   ├── security.ts       # Sanitização e validação de URLs anti-XSS
│   │   ├── share.ts          # Web Share API & Clipboard
│   │   ├── storage.ts        # Camada de persistência local e Firestore
│   │   └── time.ts           # Verificação de status de funcionamento
│   ├── types.ts              # Definições globais de tipagem TypeScript
│   ├── App.tsx               # Componente raiz e controle de estado
│   └── main.tsx              # Ponto de entrada React
├── server.ts                 # Servidor Express com APIs de IA e middlewares
├── firestore.rules           # Regras de segurança do Firestore (ABAC)
├── firebase-blueprint.json   # Esquema estrutural do banco de dados
├── package.json              # Dependências e scripts
└── vite.config.ts            # Configuração do Vite e plugins
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** ou **bun** / **yarn**

### 1. Clonar o Repositório
```bash
git clone https://github.com/SEU-USUARIO/allmoco-ufcg.git
cd allmoco-ufcg
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
GEMINI_API_KEY="SUA_CHAVE_GEMINI_AQUI"
```

> **Nota:** Para obter uma chave gratuita da API do Gemini, acesse o [Google AI Studio](https://aistudio.google.com/).

### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação no navegador em: **`http://localhost:3000`**.

### 5. Build de Produção
```bash
npm run build
npm start
```

---

## 🤝 Contribuições

Contribuições da comunidade acadêmica da UFCG são muito bem-vindas!
1. Faça um **Fork** do projeto
2. Crie uma branch para sua funcionalidade (`git checkout -b feature/minha-feature`)
3. Faça o commit das alterações (`git commit -m 'feat: Adiciona filtro por forma de pagamento'`)
4. Envie para a branch principal (`git push origin feature/minha-feature`)
5. Abra um **Pull Request**

---

## 📄 Licença

Este projeto é disponibilizado sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais detalhes.

<p align="center">
  Desenvolvido com 🧡 para a comunidade acadêmica da <strong>Universidade Federal de Campina Grande (UFCG)</strong>.
</p>
