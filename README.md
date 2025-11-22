# block-blast-android
# Tetris do Thiago (web)

Versão web inspirada em Block Blast / 1010!, agora com tabuleiro 8x8, manchetes animadas e troca de cores a cada marco de 1000 pontos. Funciona direto no navegador, inclusive em celulares Android.

## Como jogar
- Ao abrir, você vê a tela de abertura; clique em **Iniciar** para gerar o tabuleiro 8x8 e começar.
- Arraste uma das três peças exibidas abaixo do tabuleiro e solte na grade. Só é posicionada se todos os blocos couberem em espaços vazios.
- Linhas completas (horizontais ou verticais) são removidas. A pontuação soma o valor de cada bloco colocado e aplica multiplicador pelo número de linhas/colunas limpas de uma só vez.
- Toda vez que sua pontuação passa de um múltiplo de 1000, o tema de cores muda e um som curto é tocado.
- Manchetes grandes e animadas surgem no centro ao limpar linhas; se o tabuleiro ficar vazio após uma jogada, um bônus especial é concedido e uma manchete extra aparece.
- Se nenhuma das peças disponíveis couber em lugar nenhum, a partida termina e surge a tela de **Game Over** com pontuação final, melhor score e botão **Jogar de novo** (o best score fica salvo em `localStorage`).

## Rodando localmente
Não é necessário servidor: basta abrir o arquivo `index.html` em qualquer navegador moderno (desktop ou celular).

1. Baixe ou clone este repositório.
2. Abra o arquivo `index.html` (por exemplo, clique duas vezes ou arraste para a janela do navegador).
3. Clique em **Iniciar** e comece a jogar!

## Arquivos principais
- `index.html` — estrutura da página, telas de abertura e Game Over.
- `style.css` — estilos responsivos, animações das manchetes e temas dinâmicos.
- `script.js` — lógica do tabuleiro, peças, pontuação com multiplicador, bônus de tabuleiro vazio e milestones de 1000 pontos.
- `clear-sound.mp3` — efeito usado ao atingir novos marcos de 1000 pontos.
