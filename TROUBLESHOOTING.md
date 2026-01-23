# 🔧 Troubleshooting - Sala de Boliche

## ❌ Problema: "A sala não abre, fica carregando"

### Possíveis Causas e Soluções:

#### 1. **Modelos GLTF não carregam**
**Sintoma:** Tela fica em "loading" indefinidamente

**Soluções:**
- Verifique se os arquivos existem:
  - `assets/test_env.gltf`
  - `assets/pino.gltf`
  - `assets/bola.gltf`
- Abra o Console (F12) e veja se há erros 404
- Se os modelos não carregarem, a cena ainda deve abrir (mas sem os modelos)

#### 2. **Erros de JavaScript**
**Sintoma:** Console mostra erros em vermelho

**Soluções:**
- Abra o Console (F12)
- Procure por erros em vermelho
- Verifique se os scripts estão carregando:
  - `bowling-ball-interaction.js`
  - `bowling-scoreboard.js`

#### 3. **Problemas de CORS (Cross-Origin)**
**Sintoma:** Erros sobre "CORS policy" ou "blocked"

**Soluções:**
- Use um servidor local (não abra o arquivo diretamente)
- Use `python -m http.server 8000` na pasta do projeto
- Ou use extensão do Chrome "Live Server"

#### 4. **A-Frame não carrega**
**Sintoma:** Nada aparece, console vazio

**Soluções:**
- Verifique sua conexão com internet
- Os scripts do A-Frame vêm de CDN
- Tente recarregar a página (Ctrl+F5)

## 🔍 Como Diagnosticar

1. **Abra o Console (F12)**
2. **Procure por:**
   - `✅ Cena A-Frame carregada!` - Se aparecer, a cena carregou
   - `✅ Cursor de boliche inicializado` - Script de interação carregou
   - `✅ Bola inicializada` - Bola foi criada
   - `📌 Placar: 10 pinos encontrados` - Pinos foram detectados

3. **Se não aparecer nada:**
   - Verifique se há erros em vermelho
   - Verifique se os scripts estão sendo carregados (aba Network no DevTools)

## 🚀 Solução Rápida

Se nada funcionar, tente esta versão mínima:

1. Remova temporariamente o modelo `envModel`:
   ```html
   <!-- Comente esta linha -->
   <!-- <a-entity id="env" gltf-model="#envModel"></a-entity> -->
   ```

2. Use formas primitivas temporárias:
   - Substitua `gltf-model="#bolaModel"` por `geometry="primitive: sphere; radius: 0.175"`
   - Substitua `gltf-model="#pinoModel"` por `geometry="primitive: cylinder; height: 0.4; radius: 0.05"`

3. Teste se a cena abre sem os modelos GLTF

## 📝 Checklist

- [ ] Console (F12) aberto
- [ ] Sem erros em vermelho
- [ ] Scripts carregando (ver aba Network)
- [ ] Modelos GLTF existem na pasta `assets/`
- [ ] Servidor local rodando (se necessário)

## 💡 Dica

Se a cena não carregar, **comente temporariamente** o modelo de ambiente:
```html
<!-- <a-entity id="env" gltf-model="#envModel"></a-entity> -->
```

Isso pode acelerar o carregamento e permitir que você teste o resto.
