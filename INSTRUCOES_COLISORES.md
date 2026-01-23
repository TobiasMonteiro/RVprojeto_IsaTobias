# Instruções: Sistema de Colisores da Pista de Bowling

## ✅ Arquivos Criados

1. **`bowling-lane-colliders.js`** - Componente A-Frame que cria colisores físicos separados
2. **`setup-lane.js`** - Script que instancia automaticamente os colisores na cena

## ✅ Scripts Adicionados ao index.html

Os seguintes scripts foram adicionados ao final do `<body>`:

```html
<script src="bowling-lane-colliders.js"></script>
<script src="setup-lane.js"></script>
```

**Nenhuma outra modificação no HTML é necessária.**

## ⚠️ IMPORTANTE: Conflito com envModel

Seu `envModel` atualmente tem:
```html
<a-entity id="env" gltf-model="#envModel" static-body="shape: hull">
```

O `static-body="shape: hull"` no modelo GLTF pode estar criando um colisor que cobre toda a pista, **bloqueando o comportamento correto das calhas**.

### Soluções Possíveis:

**Opção 1 (Recomendada):** Remover o `static-body` do `envModel` e usar apenas os colisores específicos:
```html
<a-entity id="env" gltf-model="#envModel" material="color:#FFFFFF" shadow="cast: true">
  <!-- Remover: static-body="shape: hull" -->
</a-entity>
```

**Opção 2:** Se precisar manter o colisor do ambiente, ajuste o `centerY` dos colisores para ficarem ligeiramente acima do hull do modelo.

## 🔧 Configuração dos Colisores

Os valores padrão em `setup-lane.js` são:

```javascript
laneWidth: 1.05,        // largura da pista jogável
gutterWidth: 0.23,     // largura de cada calha
gutterDepth: 0.08,     // profundidade da calha (quanto mais baixa)
wallHeight: 0.12,      // altura das paredes
length: 18.3,          // comprimento da pista

centerX: 0,            // ajuste conforme sua pista
centerY: 0,             // ajuste conforme sua pista
centerZ: 0,             // ajuste conforme sua pista
```

### Ajustar Posicionamento:

1. Abra `setup-lane.js`
2. Modifique `centerX`, `centerY`, `centerZ` conforme a posição real da sua pista
3. Se necessário, ajuste as dimensões (`laneWidth`, `gutterWidth`, etc.)

## 🐛 Debug Visual

Para visualizar os colisores durante o desenvolvimento:

1. Abra `setup-lane.js`
2. Mude `visible: false` para `visible: true`
3. Os colisores aparecerão como caixas vermelhas semi-transparentes

## 📐 Estrutura Física Criada

```
┌─────────────────────────────────────┐
│  Parede Externa Esquerda            │
│  ┌─────────────────────────────┐   │
│  │ Calha Esquerda (baixa)       │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ Pista Central (alta)    │ │   │ ← Bola rola aqui normalmente
│  │ └─────────────────────────┘ │   │
│  │ Calha Direita (baixa)       │   │
│  └─────────────────────────────┘   │
│  Parede Externa Direita             │
└─────────────────────────────────────┘
```

## ✅ Comportamento Esperado

- ✅ Bola rola normalmente na pista central
- ✅ Bola cai na calha quando ultrapassa os limites laterais
- ✅ Bola permanece na calha (não volta para a pista)
- ✅ Paredes impedem a bola de sair das calhas

## 🔍 Verificação

1. Abra o console do navegador (F12)
2. Procure por: `✅ Colisores da pista de bowling criados com sucesso!`
3. Se aparecer, os colisores foram criados corretamente

## 📝 Notas Técnicas

- Todos os colisores usam `static-body` (não se movem)
- A pista central está na altura `centerY`
- As calhas estão na altura `centerY - gutterDepth` (mais baixas)
- As paredes têm altura suficiente para impedir a bola de pular
