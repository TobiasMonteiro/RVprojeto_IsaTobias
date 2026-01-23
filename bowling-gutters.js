/**
 * Componente A-Frame: bowling-gutters
 * Cria calhas laterais (gutters) de bowling com física para a bola cair e rolar
 */

AFRAME.registerComponent('bowling-gutters', {
  schema: {
    // Dimensões da pista
    laneWidth: { type: 'number', default: 1.05 },      // largura jogável da pista (padrão bowling: ~1.05m)
    gutterWidth: { type: 'number', default: 0.23 },    // largura de cada calha (padrão: ~0.23m)
    gutterDepth: { type: 'number', default: 0.08 },     // profundidade/queda da calha (mais profunda para realismo)
    wallHeight: { type: 'number', default: 0.08 },      // altura das paredes verticais
    length: { type: 'number', default: 18.3 },          // comprimento no eixo Z (padrão: ~18.3m)
    
    // Posicionamento
    centerX: { type: 'number', default: 0 },
    centerY: { type: 'number', default: 0 },
    centerZ: { type: 'number', default: 0 },
    
    // Opções visuais
    visible: { type: 'boolean', default: true },        // mostrar calhas (true = sempre visível)
    enableLED: { type: 'boolean', default: true },      // ativar iluminação LED azul
    gutterColor: { type: 'string', default: '#0a0a0a' }, // cor escura do fundo da calha (metal escuro)
    wallColor: { type: 'string', default: '#1a1a1a' },   // cor escura das paredes
    ledColor: { type: 'string', default: '#00aaff' }     // cor do LED azul
  },

  init: function () {
    const el = this.el;
    const data = this.data;
    
    // Calcular posições
    const halfLaneWidth = data.laneWidth / 2;
    const halfGutterWidth = data.gutterWidth / 2;
    const halfLength = data.length / 2;
    
    // Posição da calha esquerda (vista de frente, -X)
    const leftGutterX = data.centerX - halfLaneWidth - halfGutterWidth;
    
    // Posição da calha direita (vista de frente, +X)
    const rightGutterX = data.centerX + halfLaneWidth + halfGutterWidth;
    
    // Altura do fundo da calha (mais baixo que a pista)
    const gutterBottomY = data.centerY - data.gutterDepth;
    
    // ========== CALHA ESQUERDA ==========
    this.createGutter('left', leftGutterX, gutterBottomY, data.centerZ, data);
    
    // ========== CALHA DIREITA ==========
    this.createGutter('right', rightGutterX, gutterBottomY, data.centerZ, data);
    
    // ========== PAREDES INTERNAS (entre pista e calha) ==========
    // Parede interna esquerda - vertical, separando pista da calha
    this.createWall(
      'inner-left',
      data.centerX - halfLaneWidth,
      data.centerY - data.gutterDepth / 2,
      data.centerZ,
      data.gutterDepth + data.wallHeight,
      0.015, // espessura visível
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
      0.015,
      data.length,
      data
    );
    
    // ========== PAREDES EXTERNAS (lado de fora da calha) ==========
    // Parede externa esquerda - vertical, na borda externa
    this.createWall(
      'outer-left',
      leftGutterX - halfGutterWidth,
      data.centerY - data.gutterDepth / 2,
      data.centerZ,
      data.gutterDepth + data.wallHeight,
      0.015,
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
      0.015,
      data.length,
      data
    );
    
    // ========== ILUMINAÇÃO LED AZUL (se habilitada) ==========
    if (data.enableLED && data.visible) {
      // LED interno esquerdo (borda entre pista e calha esquerda)
      this.createLED('led-inner-left', data.centerX - halfLaneWidth, data.centerY, data.centerZ, data.length, data);
      
      // LED externo esquerdo (borda externa da calha esquerda)
      this.createLED('led-outer-left', leftGutterX - halfGutterWidth, data.centerY - data.gutterDepth, data.centerZ, data.length, data);
      
      // LED interno direito
      this.createLED('led-inner-right', data.centerX + halfLaneWidth, data.centerY, data.centerZ, data.length, data);
      
      // LED externo direito
      this.createLED('led-outer-right', rightGutterX + halfGutterWidth, data.centerY - data.gutterDepth, data.centerZ, data.length, data);
    }
  },

  /**
   * Cria uma calha (fundo escuro e reflexivo)
   */
  createGutter: function (side, x, y, z, data) {
    // Fundo da calha (plano horizontal, material escuro e reflexivo)
    const gutterBottom = document.createElement('a-box');
    gutterBottom.setAttribute('width', data.gutterWidth);
    gutterBottom.setAttribute('height', 0.01);
    gutterBottom.setAttribute('depth', data.length);
    gutterBottom.setAttribute('position', {
      x: x,
      y: y,
      z: z
    });
    gutterBottom.setAttribute('static-body', {
      shape: 'box',
      type: 'static'
    });
    gutterBottom.setAttribute('visible', data.visible);
    gutterBottom.setAttribute('material', {
      color: data.gutterColor,
      roughness: 0.2,      // superfície polida/reflexiva
      metalness: 0.9,      // material metálico escuro
      shader: 'standard'
    });
    gutterBottom.setAttribute('id', `gutter-bottom-${side}`);
    
    this.el.appendChild(gutterBottom);
  },

  /**
   * Cria uma parede vertical (escura e reflexiva)
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
    wall.setAttribute('static-body', {
      shape: 'box',
      type: 'static'
    });
    wall.setAttribute('visible', data.visible);
    wall.setAttribute('material', {
      color: data.wallColor,
      roughness: 0.2,      // superfície polida
      metalness: 0.8,       // material metálico escuro
      shader: 'standard'
    });
    wall.setAttribute('id', `gutter-wall-${name}`);
    
    this.el.appendChild(wall);
  },

  /**
   * Cria uma faixa de LED azul (iluminação emissiva)
   */
  createLED: function (name, x, y, z, length, data) {
    const led = document.createElement('a-box');
    led.setAttribute('width', 0.005);  // faixa muito fina
    led.setAttribute('height', 0.01);
    led.setAttribute('depth', length);
    led.setAttribute('position', {
      x: x,
      y: y,
      z: z
    });
    led.setAttribute('visible', data.visible);
    led.setAttribute('material', {
      color: data.ledColor,
      emissive: data.ledColor,
      emissiveIntensity: 2.0,
      shader: 'flat'
    });
    led.setAttribute('id', `gutter-led-${name}`);
    
    this.el.appendChild(led);
  },

  /**
   * Atualiza quando os dados mudam
   */
  update: function (oldData) {
    // Se os dados mudarem, recriar tudo
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
