# 🎳 Sala de Boliche em A-Frame - Documentação Completa

## ✅ Sistema Completo Implementado

Este projeto implementa uma **sala de boliche completa e interativa** em A-Frame com física realista, permitindo que o utilizador jogue uma bola e derrube pinos de forma natural.

---

## 🎮 Funcionalidades Principais

### 1. **Cursor como "Mão Virtual"**
- ✅ Detecção de objetos via raycasting
- ✅ Pegar, segurar e lançar a bola
- ✅ Transferência de velocidade do movimento do cursor
- ✅ Funciona em desktop (mouse) e VR (controllers)

### 2. **Bola de Boliche**
- ✅ Corpo dinâmico com física realista (massa: 7kg)
- ✅ Colisão esférica precisa
- ✅ Física desativada enquanto segurada
- ✅ Física reativada ao soltar com velocidade transferida
- ✅ Rotação realista baseada no movimento

### 3. **Pista de Boliche**
- ✅ Chão físico com colisores separados
- ✅ Calhas laterais (gutters) rebaixadas
- ✅ Paredes laterais para impedir que a bola saia
- ✅ Sistema de colisores independente do modelo GLTF

### 4. **Pinos de Boliche**
- ✅ 10 pinos em formação triangular padrão
- ✅ Cada pino com corpo dinâmico (massa: 1.5kg)
- ✅ Colisão ativa e física realista
- ✅ Caem naturalmente ao serem atingidos
- ✅ Sistema de pontuação automático

### 5. **Placar Digital**
- ✅ TV suspensa no teto
- ✅ Mostra placar e número de pinos derrubados
- ✅ Atualização automática

---

## 📁 Estrutura de Arquivos

### Componentes Principais:
- **`bowling-cursor-interaction.js`** - Interação cursor-bola
- **`bowling-lane-colliders.js`** - Colisores físicos da pista
- **`bowling-gutters.js`** - Calhas visuais (opcional)
- **`bowling-scoreboard.js`** - Sistema de pontuação

### Scripts de Setup:
- **`setup-lane.js`** - Configura colisores da pista
- **`setup-gutters.js`** - Configura calhas visuais
- **`setup-pins.js`** - Cria 10 pinos em formação triangular

### Documentação:
- **`INSTRUCOES_INTERACAO.md`** - Guia de interação
- **`INSTRUCOES_COLISORES.md`** - Guia de colisores
- **`README_BOWLING.md`** - Este arquivo

---

## 🎯 Como Usar

### Desktop (Mouse):
1. **Mover o cursor** sobre a bola de boliche
2. **Clicar e segurar** o botão esquerdo do mouse
3. **Mover o mouse** para posicionar a bola (simula movimento de lançamento)
4. **Soltar o botão** para lançar a bola

### VR (Controllers):
1. **Apontar o controller** para a bola
2. **Pressionar o trigger** para pegar
3. **Mover o controller** para posicionar
4. **Soltar o trigger** para lançar

---

## ⚙️ Configurações

### Física da Cena:
```html
physics="friction: 0.1; restitution: 0.3; gravity: -9.8"
```
- `friction`: Atrito entre objetos (0.1 = baixo)
- `restitution`: Elasticidade (0.3 = pouco elástico)
- `gravity`: Gravidade realista (-9.8 m/s²)

### Bola de Boliche:
```html
dynamic-body="shape: sphere; sphereRadius: .175; mass: 7; linearDamping: 0.1; angularDamping: 0.1"
```
- `mass`: 7kg (padrão de bola de boliche)
- `linearDamping`: Amortecimento linear
- `angularDamping`: Amortecimento angular

### Pinos:
```html
dynamic-body="mass: 1.5; linearDamping: 0.4; angularDamping: 0.4"
```
- `mass`: 1.5kg (padrão de pino de boliche)
- Damping maior para estabilidade

### Interação do Cursor:
```html
bowling-cursor-interaction="throwForce: 20; maxThrowForce: 40; grabDistance: 0.6"
```
- `throwForce`: Força base do lançamento (20)
- `maxThrowForce`: Força máxima permitida (40)
- `grabDistance`: Distância para pegar objetos (0.6m)

---

## 🔧 Ajustes Personalizados

### Ajustar Força do Lançamento:
Edite `bowling-cursor-interaction.js`:
```javascript
throwForce: { type: 'number', default: 20 },    // aumentar = mais força
maxThrowForce: { type: 'number', default: 40 }, // limite máximo
```

### Ajustar Posição dos Pinos:
Edite `setup-pins.js`:
```javascript
const startX = 0;        // posição X (centro)
const startY = 0.4;      // altura dos pinos
const startZ = -15;     // distância da câmera
```

### Ajustar Dimensões da Pista:
Edite `setup-lane.js`:
```javascript
laneWidth: 1.05,        // largura da pista
gutterWidth: 0.23,      // largura das calhas
gutterDepth: 0.08,      // profundidade das calhas
length: 18.3,           // comprimento da pista
```

---

## 🐛 Debug

### Verificar se Está Funcionando:

1. **Console do Navegador (F12)**:
   - `✅ Colisores da pista criados!`
   - `✅ X pinos criados em formação triangular!`
   - `🎳 Bola agarrada!` (ao pegar)
   - `🎳 Bola lançada!` (ao soltar)

2. **Modo Debug Visual**:
   - Em `setup-lane.js`, mude `visible: false` para `visible: true`
   - Os colisores aparecerão como caixas vermelhas semi-transparentes

3. **Física Debug**:
   - No `index.html`, mude `physics="debug: false"` para `debug: true`
   - Verá wireframes dos corpos físicos

---

## ✅ Requisitos Técnicos Atendidos

- ✅ **Sistema de física**: Cannon.js via aframe-physics-system
- ✅ **Componentes de interação**: hoverable, grabbable, draggable
- ✅ **Física só atua quando libertado**: Bola usa kinematic enquanto segurada
- ✅ **Cursor como mão virtual**: Raycasting + detecção de objetos
- ✅ **Transferência de velocidade**: Calculada baseada no movimento do cursor
- ✅ **Pista com chão físico**: Colisores separados e independentes
- ✅ **Paredes laterais**: Impedem bola de sair
- ✅ **Bola com massa realista**: 7kg
- ✅ **10 pinos em formação triangular**: Automático via setup-pins.js
- ✅ **Pinos caem naturalmente**: Física dinâmica ativa
- ✅ **Funciona em desktop e VR**: Suporte completo

---

## 📝 Notas Importantes

### Conflito com envModel:
O `envModel` GLTF tem `static-body="shape: hull"` que pode interferir. Se a bola não cair nas calhas:
- Remova `static-body="shape: hull"` do `envModel`
- Use apenas os colisores específicos criados por `bowling-lane-colliders`

### Performance:
- Física debug desativada por padrão (`debug: false`)
- Se necessário, ajuste `interval` do raycaster para melhor performance

### Compatibilidade:
- A-Frame 1.4.0
- aframe-physics-system v4.1.0
- aframe-physics-extras
- aframe-extras v7.0.0

---

## 🎉 Resultado Final

Uma experiência completa de boliche onde:
- O utilizador pega a bola com o cursor
- Lança a bola com movimento natural
- A bola rola pela pista e cai nas calhas se errar
- Os pinos caem de forma realista
- O placar atualiza automaticamente

**Divirta-se jogando! 🎳**
