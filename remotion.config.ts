import {Config} from '@remotion/cli/config';

Config.setCodec('h264');
Config.setVideoImageFormat('jpeg');
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
// Tudo que está em projetos/ pode ser usado com staticFile('<NNN. slug>/...').
Config.setPublicDir('projetos');
// O cache persistente do webpack falha com EPERM em algumas instalações do Windows.
Config.setCachingEnabled(false);
// Desempenho do render (não muda nada no visual):
// usa todos os núcleos do processador em paralelo (padrão do Remotion é a metade)…
Config.setConcurrency('100%');
// …e a placa de vídeo para filtros, desfoques e mesclagens (padrão é desenhar tudo no processador).
Config.setChromiumOpenGlRenderer('angle');
