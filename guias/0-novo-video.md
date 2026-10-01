# Novo vídeo em 1 prompt (PC local)

Use este guia para editar um vídeo novo no PC onde o vídeo está. A primeira parte é feita **uma vez só** por PC.

## Uma vez por PC

1. Abra o **Claude Desktop**, vá na aba **Code** e escolha **Local** (não "nuvem").
2. Em **pasta do projeto**, escolha `Área de Trabalho\studio`. Se a pasta não existir nesse PC, escolha a Área de Trabalho: o prompt abaixo baixa o projeto sozinho.
3. Quando o Claude pedir permissão para rodar comandos, aceite. Ele vai instalar o que faltar (Python, FFmpeg, transcrição, skills).
4. Depois da primeira instalação, **feche e abra a sessão de novo** para as skills novas aparecerem.

## A cada vídeo novo

1. Crie a pasta do projeto e coloque o vídeo:

   ```text
   studio\projetos\002. nome-do-video\video\video.mp4
   studio\projetos\002. nome-do-video\prints\        (opcional: prints do que quer ver animado)
   ```

   Use o próximo número livre (`002`, `003`…).

2. Abra uma sessão **Code → Local** na pasta `studio` e cole o prompt abaixo, trocando o que está entre colchetes.

## O prompt

```text
Quero editar um vídeo novo no Nível 1 (Remotion).

Antes de tudo, sem me perguntar:
- se esta pasta não for o repositório Jobim17/studio, clone https://github.com/Jobim17/studio.git (ramo main-4admha) na Área de Trabalho e trabalhe lá;
- rode git pull para pegar a versão mais nova;
- confira e instale o que faltar (node_modules, Python, FFmpeg, faster-whisper, skills watch e remotion-best-practices), seguindo o CLAUDE.md. Se precisar reabrir a sessão, me avise.

Projeto: projetos/[002. nome-do-video]
Formato: [vertical 9:16 | horizontal 16:9]
Estilo: [ex.: escuro e cinematográfico, cores quentes cobre/âmbar, sans-serif, legendas em negativo, motions, zooms estratégicos — igual ao 001. Reels Teste]
Efeitos sonoros: [sim, os arquivos estão em projetos/.../sfx | não]
Observações: [o que mais quiser]

Assista o vídeo, transcreva, me mostre o plano para eu aprovar e, depois de aprovado, programe, gere os stills de revisão e, com meu ok, renderize com o renderizar-rapido.bat (ou node scripts/render-rapido.mjs <Composicao> "edicoes/<projeto>/final.mp4").
Ao final, faça commit e push do código, do plano e da transcrição (projetos/ é ignorado pelo git: use git add -f no plano.md e na pasta transcricao/, nunca nos vídeos).
```

O Claude vai parar em três momentos para você aprovar: o **plano**, os **stills de revisão** e o **render final**.
