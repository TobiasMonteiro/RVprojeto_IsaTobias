# Instruções: Sistema de Interação com Cursor

## ✅ Funcionalidades Implementadas

### 🎯 Cursor como "Mão Virtual"
- O cursor detecta objetos interativos através de raycasting
- Permite pegar, segurar e lançar a bola de boliche
- Transfere velocidade do movimento do cursor para a bola ao lançar

### 🎳 Bola de Boliche
- Corpo dinâmico com física realista
- Massa: 7kg (padrão de bola de boliche)
- Pode ser pega e lançada pelo cursor
- Física desativada enquanto está sendo segurada
- Física reativada ao soltar com velocidade transferida

### 🎯 Pinos de Boliche
- 10 pinos em formação triangular padrão
- Cada pino tem corpo dinâmico e colisão ativa
- Caem de forma natural ao serem atingidos
- Sistema de pontuação detecta pinos derrubados

## 🎮 Como Usar

### Desktop (Mouse)
1. **Mover o cursor** sobre a bola de boliche
2. **Clicar e segurar** o botão esquerdo do mouse
3. **Mover o mouse** para "puxar" a bola (simula movimento de lançamento)
4. **Soltar o botão** para lançar a bola

### VR (Controllers)
1. **Apontar o controller** para a bola
2. **Pressionar o botão de trigger** para pegar
3. **Mover o controller** para posicionar a bola
4. **Soltar o trigger** para lançar

## ⚙️ Configuração

### Ajustar Força do Lançamento

Edite `bowling-cursor-interaction.js`:

```javascript
schema: {
  throwForce: { type: 'number', default: 15 },      // força base do lançamento
  maxThrowForce: { type: 'number', default: 30 },   // força máxima permitida
  grabDistance: { type: 'number', default: 0.5 },    // distância do cursor para pegar
  releaseDelay: { type: 'number', default: 50 }     // delay para reativar física
}
```

### Ajustar Posição dos Pinos

Edite `setup-pins.js`:

```javascript
const startX = 0;        // posição X inicial (centro)
const startY = 0.4;      // altura dos pinos
const startZ = -15;      // distância da câmera (negativo = frente)
const pinSpacing = 0.3;  // espaçamento entre pinos
const rowSpacing = 0.26; // espaçamento entre linhas
```

### Ajustar Propriedades da Bola

Edite o mixin `bola` no `index.html`:

```html
<a-mixin
  id="bola"
  dynamic-body="shape: sphere; sphereRadius: .175; mass: 7; linearDamping: 0.1; angularDamping: 0.1"
  ...
></a-mixin>
```

- `mass`: massa da bola (kg)
- `linearDamping`: amortecimento linear (0-1)
- `angularDamping`: amortecimento angular (0-1)

## 📐 Estrutura dos Arquivos

### Arquivos Criados:
1. **`bowling-cursor-interaction.js`** - Componente de interação cursor-bola
2. **`setup-pins.js`** - Script que cria os 10 pinos em formação triangular

### Arquivos Modificados:
1. **`index.html`** - Adicionado componente ao cursor e melhorada configuração da bola

## 🔧 Detalhes Técnicos

### Sistema de Física
- **Enquanto segura**: Bola usa `kinematic` body (não afetada por física, mas colide)
- **Ao soltar**: Bola volta para `dynamic` body (afetada por física)
- **Velocidade**: Calculada baseada no movimento do cursor nos últimos frames

### Detecção de Objetos
- Raycasting configurado para detectar objetos com classe `.bolas` ou mixin `bola`
- Distância máxima de detecção: 10 unidades
- O cursor precisa estar apontando diretamente para a bola

### Feedback Visual
- Bola aumenta ligeiramente de escala quando pega (1.1x)
- Volta ao tamanho normal ao soltar
- Animações suaves de transição

## 🐛 Debug

### Verificar se a Interação Está Funcionando

1. Abra o console do navegador (F12)
2. Procure por mensagens:
   - `🎳 Bola agarrada!` - quando pega a bola
   - `🎳 Bola lançada! Velocidade: ...` - quando solta a bola

### Problemas Comuns

**Bola não é detectada:**
- Verifique se o raycaster está configurado corretamente
- Certifique-se de que a bola tem a classe `.bolas` ou mixin `bola`
- Aumente `grabDistance` se necessário

**Bola não lança com força suficiente:**
- Aumente `throwForce` no componente
- Mova o cursor mais rápido ao soltar

**Bola atravessa objetos:**
- Verifique se os colisores estão configurados corretamente
- Certifique-se de que `static-body` está nos objetos estáticos
- Verifique se `dynamic-body` está na bola

## ✅ Requisitos Atendidos

- ✅ Cursor funciona como "mão virtual"
- ✅ Detecção de objetos via raycasting
- ✅ Pegar, segurar e largar objetos com física
- ✅ Transferência de velocidade ao lançar
- ✅ Pista com chão físico e paredes laterais
- ✅ Bola com corpo dinâmico e massa realista
- ✅ 10 pinos em formação triangular
- ✅ Pinos caem naturalmente ao serem atingidos
- ✅ Física só atua quando objetos são libertados
- ✅ Funciona em desktop e VR
