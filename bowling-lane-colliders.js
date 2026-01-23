/**
 * Componente A-Frame: bowling-lane-colliders
 * Cria colisores físicos separados para pista central e calhas laterais
 * Focado APENAS em física - sem dependência do modelo GLTF do ambiente
 * 
 * ESTRUTURA FÍSICA:
 * - Pista central (plano alto - onde a bola rola normalmente)
 * - Calha esquerda (plano baixo - onde a bola cai)
 * - Calha direita (plano baixo - onde a bola cai)
 * - Paredes internas (impedem bola de voltar da calha para a pista)
 * - Paredes externas (impedem bola de sair das calhas)
 */

AFRAME.registerComponent('bowling-lane-colliders', {
  schema: {
    // Dimensões da pista
    laneWidth: { type: 'number', default: 1.05 },      // largura jogável da pista (padrão oficial: 1.05m)
    gutterWidth: { type: 'number', default: 0.23 },   // largura de cada calha (padrão oficial: ~0.23m)
    gutterDepth: { type: 'number', default: 0.08 },     // profundidade da calha (quanto mais baixa que a pista)
    wallHeight: { type: 'number', default: 0.12 },      // altura das paredes verticais (deve ser > gutterDepth)
    length: { type: 'number', default: 18.3 },          // comprimento da pista no eixo Z (padrão oficial: 18.3m)
    
    // Posicionamento
    centerX: { type: 'number', default: 0 },            // centro X da pista
    centerY: { type: 'number', default: 0 },            // altura Y da pista (onde a bola rola)
    centerZ: { type: 'number', default: 0 },            // centro Z da pista
    
    // Opções de debug
    visible: { type: 'boolean', default: false },       // mostrar colisores (false = invisível, true = debug visual)
    color: { type: 'string', default: '#ff0000' },      // cor dos colisores quando visíveis (vermelho para debug)
    opacity: { type: 'number', default: 0.3 }           // opacidade quando visíveis (0.3 = semi-transparente)
  },

  init: function () {
    const el = this.el;
    const data = this.data;
    
    // Calcular posições
    const halfLaneWidth = data.laneWidth / 2;
    const halfGutterWidth = data.gutterWidth / 2;
    
    // Posição X das calhas
    const leftGutterX = data.centerX - halfLaneWidth - halfGutterWidth;
    const rightGutterX = data.centerX + halfLaneWidth + halfGutterWidth;
    
    // Altura do fundo das calhas (mais baixo que a pista)
    const gutterBottomY = data.centerY - data.gutterDepth;
    
    // ========== PISTA CENTRAL (plano alto) ==========
    this.createLane(data.centerX, data.centerY, data.centerZ, data);
    
    // ========== CALHA ESQUERDA (plano baixo) ==========
    this.createGutter('left', leftGutterX, gutterBottomY, data.centerZ, data);
    
    // ========== CALHA DIREITA (plano baixo) ==========
    this.createGutter('right', rightGutterX, gutterBottomY, data.centerZ, data);
    
    // ========== PAREDES INTERNAS (impedem bola de voltar da calha para a pista) ==========
    // Parede interna esquerda - vertical, na borda entre pista e calha esquerda
    this.createWall(
      'inner-left',
      data.centerX - halfLaneWidth,
      data.centerY - data.gutterDepth / 2,
      data.centerZ,
      data.gutterDepth + data.wallHeight,
      0.02, // espessura suficiente para física estável
      data.length,
      data
    );
    
    // Parede interna direita
    this.createWall(
      'inner-right',
      data.centerX + halfLaneWidth,
      data.centerY - data.gutterDepth / 2,
      data.centerZ,
      data.gutterDepth + data.wallHeight,
      0.02,
      data.length,
      data
    );
    
    // ========== PAREDES EXTERNAS (impedem bola de sair das calhas) ==========
    // Parede externa esquerda - vertical, na borda externa da calha esquerda
    this.createWall(
      'outer-left',
      leftGutterX - halfGutterWidth,
      data.centerY - data.gutterDepth / 2,
      data.centerZ,
      data.gutterDepth + data.wallHeight,
      0.02,
      data.length,
      data
    );
    
    // Parede externa direita
    this.createWall(
      'outer-right',
      rightGutterX + halfGutterWidth,
      data.centerY - data.gutterDepth / 2,
      data.centerZ,
      data.gutterDepth + data.wallHeight,
      0.02,
      data.length,
      data
    );
  },

  /**
   * Cria o colisor da pista central (plano horizontal alto)
   * A bola rola normalmente aqui quando está na pista
   */
  createLane: function (x, y, z, data) {
    const lane = document.createElement('a-box');
    lane.setAttribute('width', data.laneWidth);
    lane.setAttribute('height', 0.01); // plano fino
    lane.setAttribute('depth', data.length);
    lane.setAttribute('position', {
      x: x,
      y: y,
      z: z
    });
    
    // Colisor estático - não se move, apenas colide
    lane.setAttribute('static-body', {
      shape: 'box',
      type: 'static'
    });
    
    // Invisível por padrão (apenas física)
    lane.setAttribute('visible', data.visible);
    lane.setAttribute('material', {
      color: data.color,
      opacity: data.opacity,
      transparent: true,
      shader: 'flat'
    });
    lane.setAttribute('id', 'lane-collider');
    
    this.el.appendChild(lane);
  },

  /**
   * Cria o colisor de uma calha (plano horizontal baixo)
   * A bola cai aqui quando sai da pista central
   */
  createGutter: function (side, x, y, z, data) {
    const gutter = document.createElement('a-box');
    gutter.setAttribute('width', data.gutterWidth);
    gutter.setAttribute('height', 0.01); // plano fino
    gutter.setAttribute('depth', data.length);
    gutter.setAttribute('position', {
      x: x,
      y: y,
      z: z
    });
    
    // Colisor estático - mais baixo que a pista, a bola cai aqui
    gutter.setAttribute('static-body', {
      shape: 'box',
      type: 'static'
    });
    
    // Invisível por padrão (apenas física)
    gutter.setAttribute('visible', data.visible);
    gutter.setAttribute('material', {
      color: data.color,
      opacity: data.opacity,
      transparent: true,
      shader: 'flat'
    });
    gutter.setAttribute('id', `gutter-collider-${side}`);
    
    this.el.appendChild(gutter);
  },

  /**
   * Cria uma parede vertical (colisor)
   * Impede a bola de atravessar limites (pista ↔ calha ou calha ↔ fora)
   */
  createWall: function (name, x, y, z, height, thickness, length, data) {
    const wall = document.createElement('a-box');
    wall.setAttribute('width', thickness);
    wall.setAttribute('height', height);
    wall.setAttribute('depth', length);
    wall.setAttribute('position', {
      x: x,
      y: y,
      z: z
    });
    
    // Colisor estático - barreira física
    wall.setAttribute('static-body', {
      shape: 'box',
      type: 'static'
    });
    
    // Invisível por padrão (apenas física)
    wall.setAttribute('visible', data.visible);
    wall.setAttribute('material', {
      color: data.color,
      opacity: data.opacity,
      transparent: true,
      shader: 'flat'
    });
    wall.setAttribute('id', `wall-collider-${name}`);
    
    this.el.appendChild(wall);
  },

  /**
   * Atualiza quando os dados mudam
   */
  update: function (oldData) {
    // Se os dados mudarem, recriar todos os colisores
    if (JSON.stringify(oldData) !== JSON.stringify(this.data)) {
      // Remove todos os filhos
      while (this.el.firstChild) {
        this.el.removeChild(this.el.firstChild);
      }
      // Reinicializa
      this.init();
    }
  }
});
