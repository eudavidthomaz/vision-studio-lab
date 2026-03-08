
Objetivo: remover totalmente a lógica de mute/unmute e deixar o vídeo configurado para autoplay com som já no carregamento.

Diagnóstico da causa atual:
- O `Landing.tsx` envia `mediaSrc` já com `mute=1`.
- O `HeroScrollVideo.tsx` também injeta `mute` dinamicamente na URL.
- Resultado: URL final com parâmetros duplicados/conflitantes (`mute=1` + `mute=0`), e o player permanece mudo.
- Além disso, existe estado/UI de mutar (`isMuted`, botão, ícones) que você pediu para remover.

Plano de implementação:

1) Limpar `src/components/HeroScrollVideo.tsx`
- Remover import de `Volume2` e `VolumeX`.
- Remover estado `isMuted`.
- Remover bloco do botão de volume.
- Simplificar `embedSrc` para sempre montar URL sem qualquer lógica de mute por estado.
- Garantir parâmetros de reprodução: `autoplay=1`, `loop=1`, `controls=0`, `rel=0`, `modestbranding=1`, `playlist=<id>`, `playsinline=1`, `enablejsapi=0`.
- Manter o restante da experiência visual (expansão, título, fade, conteúdo) inalterado.

2) Corrigir origem da URL em `src/pages/Landing.tsx`
- Atualizar `YOUTUBE_EMBED` para remover `mute=1`.
- Evitar parâmetros redundantes no `mediaSrc`; deixar o componente como única fonte de montagem final da URL de embed.

3) Hardening da montagem da URL
- No `HeroScrollVideo`, antes de compor parâmetros, normalizar `mediaSrc` removendo possíveis `autoplay`, `mute`, `loop`, `controls`, `playlist`, `rel`, `modestbranding` preexistentes para impedir conflito futuro.
- Isso evita regressão caso alguém passe URL “suja” novamente.

4) Validação funcional após ajuste
- Confirmar que o botão de volume não existe mais.
- Confirmar que o iframe é carregado com URL sem `mute=1`.
- Confirmar comportamento em desktop e mobile.
- Observação técnica importante: alguns navegadores podem bloquear autoplay com áudio por política de mídia; nesse caso o player pode exigir interação do usuário para iniciar som, mesmo com configuração correta.

Resultado esperado:
- Nenhum componente de mute na UI.
- Autoplay configurado com som por padrão (sem `mute=1` no código).
- Sem conflito de parâmetros na URL do YouTube.
