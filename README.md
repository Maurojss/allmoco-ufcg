# 🍽️ allmoço — Guia Universitário de Restaurantes e Cardápios (Campus UFCG)

Uma aplicação web *Single Page Application* (SPA) completa, responsiva e moderna, projetada para conectar estudantes e professores do campus da **UFCG (Universidade Federal de Campina Grande)** aos restaurantes, lanchonetes e marmiteiras do entorno do campus.

---

## 🚀 Principais Recursos

- **🔍 Busca e Filtros Avançados:**
  - Filtro por status de funcionamento em tempo real (*"Aberto Agora"*).
  - Filtros nutricionais e restrições alimentares: **Vegano (VG)**, **Sem Glúten (SG)** e **Sem Lactose (SL)**.
  - Filtro por desconto universitário exclusivo e ordenação por nota, distância ou preço.

- **🗺️ Mapa Interativo do Campus (UFCG):**
  - Mapeamento geográfico visual dos estabelecimentos em relação aos blocos acadêmicos e à praça central.
  - Exibição de distância aproximada e tempo de caminhada a partir do campus.

- **⭐ Avaliações e Resenhas em Tempo Real (Firebase):**
  - Autenticação de estudantes via **Google (Firebase Auth)**.
  - Sistema de notas (1 a 5 estrelas) e publicação de resenhas detalhadas sincronizadas via **Firebase Firestore**.

- **🥗 Calculadora Nutricional e Tabela de Pratos:**
  - Estimativa de calorias, macronutrientes (proteínas, carboidratos, gorduras) e verificação de selos de restrição por prato.

- **🏪 Painel de Gestão para Proprietários:**
  - Módulo completo para cadastro, edição de informações do restaurante, atualização de cardápios e horário de funcionamento.

- **📶 Suporte e Indicador de Cache Offline:**
  - Identificação de perda de conexão com aviso visual (*"Modo Offline"*) e navegação mantida via cache local.

- **🌙 Modo Claro e Escuro (Dark Mode):**
  - Interface com alternância de tema e animações de alta performance desenvolvidas com Framer Motion (`motion`).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Animações & Ícones:** Framer Motion (`motion/react`), Lucide React
- **Backend & Autenticação:** Firebase Auth, Firebase Firestore
- **Estilização:** Tailwind CSS (com suporte nativo a Dark Mode)

---

## 📂 Estrutura do Projeto

```
/
├── src/
│   ├── components/      # Componentes de interface (Header, RestaurantCard, CampusMap, etc.)
│   ├── lib/             # Configurações do Firebase, autenticação e sincronização
│   ├── data/            # Dados iniciais e mock data de restaurantes do campus
│   ├── types.ts         # Definições de tipos TypeScript
│   ├── App.tsx          # Componente principal e controle de estado global
│   └── main.tsx         # Ponto de entrada da aplicação React
├── public/              # Ativos estáticos
├── package.json         # Dependências do projeto
└── README.md            # Documentação do repositório
```

---

## 💻 Como Rodar o Projeto Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU-USUARIO/allmoco-ufcg.git
   cd allmoco-ufcg
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação:**
   Acesse `http://localhost:3000` no seu navegador.

---

## 📝 Licença e Créditos

Desenvolvido para apresentação do protótipo **allmoço** na Universidade Federal de Campina Grande (UFCG).
