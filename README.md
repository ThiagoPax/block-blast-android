# Block Blast Web

Jogo simples inspirado em Block Blast / 1010! feito com HTML, CSS e JavaScript puro. Funciona direto no navegador, inclusive em celulares Android.

## Como jogar
- Arraste uma das três peças exibidas abaixo do tabuleiro e solte sobre a grade 10x10.
- A peça só é posicionada se todos os blocos estiverem em espaços livres.
- Linhas completas (horizontais ou verticais) são removidas e rendem pontos extras.
- Se nenhuma das peças disponíveis couber em lugar nenhum, a partida termina e aparece a tela de **Game Over** com um botão de **Jogar de novo**.
- O melhor score é salvo automaticamente usando `localStorage`.

## Rodando localmente
Não é necessário servidor: basta abrir o arquivo `index.html` em qualquer navegador moderno (desktop ou celular).

1. Baixe ou clone este repositório.
2. Abra o arquivo `index.html` (por exemplo, clique duas vezes ou arraste para a janela do navegador).
3. Comece a jogar!

## Arquivos principais
- `index.html` — estrutura da página.
- `style.css` — estilos responsivos para celular e desktop.
- `script.js` — lógica do jogo (tabuleiro, peças, pontuação e Game Over).
