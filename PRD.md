# 🎲 PRD e Guia de Uso: Forja de Idiomas

Este documento detalha os requisitos do produto (PRD) e o passo a passo de como utilizar a versão web offline do gerador de nomes e línguas fictícias da campanha de RPG da Sarah.

---

## 1. Visão Geral do Produto
A **Forja de Idiomas** é uma aplicação web de execução local desenvolvida para gerar nomes e idiomas fictícios de forma procedural. O foco é garantir consistência fonética para diferentes culturas (Elfos, Orcs, Anões, etc.) e promover imersão no *worldbuilding* de campanhas de RPG de mesa.

## 2. Requisitos Funcionais
*   **Geração Fonética:** Criação de nomes baseados em regras específicas de vogais e consoantes para 8 culturas distintas (Comum, Élfico, Orc, Anão, Celestial, Abissal, Feérico, Cyberpunk).
*   **Controle de Tamanho:** Definição de quantidade mínima e máxima de sílabas.
*   **Significados Direcionados:** Sugestão de significados baseados na categoria selecionada (Pessoa, Lugar, Artefato, Geral).
*   **Gestão de Sessão (Histórico):** Armazenamento temporário de todos os nomes gerados enquanto a página do navegador estiver aberta.
*   **Exportação Local:** Capacidade de gerar e baixar um arquivo `.txt` com o histórico de nomes diretamente pelo navegador, sem necessidade de comunicação com servidores externos.
*   **Área de Transferência:** Botão de cópia rápida dos resultados exibidos na tela.

## 3. Requisitos Não-Funcionais e Tecnologias
*   **Frontend Puro:** Desenvolvido exclusivamente com **HTML5**, **CSS3** (com Dark Mode nativo) e **JavaScript (ES6)**.
*   **Zero Dependências:** Não requer instalação de interpretadores (como Python/Pydroid) ou servidores web.
*   **Offline-First:** Funciona 100% sem acesso à internet, rodando diretamente no motor do navegador do usuário.

---

## 4. Estrutura do Projeto
Os arquivos essenciais de funcionamento estão localizados na pasta `logica/`:
*   `index.html`: A estrutura e o conteúdo da interface visual.
*   `style.css`: A estilização do aplicativo (cores, layout responsivo para mobile).
*   `script.js`: O motor de geração procedural e a lógica de eventos.

---

## 5. Instruções de Uso (Passo a Passo para o Usuário)

O aplicativo funciona como um site normal, mas roda de forma privada no seu dispositivo, sem usar a internet. Siga os passos abaixo para começar a gerar nomes:

### No Celular (Android / iOS)
1. **Baixar o arquivo:** Faça o download do arquivo `.zip` recebido.
2. **Extrair:** Abra o seu aplicativo gerenciador de arquivos (ex: *Files do Google*), toque no arquivo `.zip` e selecione a opção **Extrair**.
3. **Executar:** Entre na pasta que foi extraída (pasta `logica`) e toque no arquivo **`index.html`**.
4. **Abrir no Navegador:** O celular perguntará qual aplicativo usar. Escolha o seu navegador favorito (Chrome, Safari, Firefox). O gerador abrirá em tela cheia e já estará pronto para uso!

### No Computador (Windows / Mac)
1. **Extrair:** Clique com o botão direito no arquivo `.zip` e escolha **"Extrair Tudo..."** ou **"Extrair Aqui"**.
2. **Executar:** Acesse a pasta extraída (`logica`) e dê dois cliques no arquivo **`index.html`**. Ele abrirá automaticamente no seu navegador padrão.

> **⚠️ Atenção ao Histórico:** Como o gerador não usa banco de dados para proteger sua privacidade, o histórico é apagado ao fechar a aba. Lembre-se de usar o botão **💾 Exportar** antes de fechar o navegador para baixar um arquivo de texto com todas as suas ideias!
