/**
 * Componente: bowling-scoreboard
 * Placar estilo TV de boliche profissional
 */

AFRAME.registerComponent('bowling-scoreboard', {
  schema: {
    fontSize: { type: 'number', default: 0.4 },
    color: { type: 'string', default: '#FFFFFF' }
  },

  init: function () {
    const el = this.el;

    // Posição do placar (TV suspensa)
    el.setAttribute('position', { x: 0, y: 3.2, z: -2 });
    el.setAttribute('rotation', { x: -10, y: 0, z: 0 });

    // Grupo principal
    this.tvGroup = document.createElement('a-entity');

    // ======= SUPORTE NO TETO =======
    this.ceilingMount = document.createElement('a-box');
    this.ceilingMount.setAttribute('width', 0.5);
    this.ceilingMount.setAttribute('height', 0.08);
    this.ceilingMount.setAttribute('depth', 0.3);
    this.ceilingMount.setAttribute('position', '0 0.5 0');
    this.ceilingMount.setAttribute('material', {
      color: '#222',
      metalness: 0.6,
      roughness: 0.3
    });

    // Haste vertical
    this.mountPole = document.createElement('a-cylinder');
    this.mountPole.setAttribute('radius', 0.04);
    this.mountPole.setAttribute('height', 0.6);
    this.mountPole.setAttribute('position', '0 0.18 0');
    this.mountPole.setAttribute('material', {
      color: '#1a1a1a',
      metalness: 0.7,
      roughness: 0.25
    });

    // ======= CORPO DA TV =======
    this.tvBody = document.createElement('a-box');
    this.tvBody.setAttribute('width', 2.8);
    this.tvBody.setAttribute('height', 1.2);
    this.tvBody.setAttribute('depth', 0.15);
    this.tvBody.setAttribute('position', '0 -0.3 0');
    this.tvBody.setAttribute('material', {
      color: '#0a0a0a',
      metalness: 0.2,
      roughness: 0.55
    });

    // Borda decorativa
    this.tvBorder = document.createElement('a-box');
    this.tvBorder.setAttribute('width', 2.9);
    this.tvBorder.setAttribute('height', 1.3);
    this.tvBorder.setAttribute('depth', 0.12);
    this.tvBorder.setAttribute('position', '0 -0.3 -0.02');
    this.tvBorder.setAttribute('material', {
      color: '#333',
      metalness: 0.4,
      roughness: 0.4
    });

    // Barra inferior (soundbar style)
    this.bottomBar = document.createElement('a-box');
    this.bottomBar.setAttribute('width', 2.8);
    this.bottomBar.setAttribute('height', 0.1);
    this.bottomBar.setAttribute('depth', 0.16);
    this.bottomBar.setAttribute('position', '0 -0.92 0');
    this.bottomBar.setAttribute('material', {
      color: '#141414',
      metalness: 0.35,
      roughness: 0.4
    });

    // ======= TELA =======
    this.tvScreen = document.createElement('a-plane');
    this.tvScreen.setAttribute('width', 2.6);
    this.tvScreen.setAttribute('height', 1.0);
    this.tvScreen.setAttribute('position', '0 -0.3 0.08');
    this.tvScreen.setAttribute('material', {
      color: '#0d1b2a',
      shader: 'flat'
    });

    // Glow da tela
    this.screenGlow = document.createElement('a-plane');
    this.screenGlow.setAttribute('width', 2.65);
    this.screenGlow.setAttribute('height', 1.05);
    this.screenGlow.setAttribute('position', '0 -0.3 0.075');
    this.screenGlow.setAttribute('material', {
      color: '#1b3a5f',
      shader: 'flat',
      transparent: true,
      opacity: 0.3
    });

    // ======= CONTEÚDO DO PLACAR =======
    
    // Título
    this.titleEl = document.createElement('a-entity');
    this.titleEl.setAttribute('position', '0 0.32 0.01');
    this.titleEl.setAttribute('text', {
      value: '🎳 BOLICHE VR 🎳',
      align: 'center',
      width: 4,
      color: '#4CC3D9',
      font: 'roboto'
    });

    // Pontuação principal
    this.scoreEl = document.createElement('a-entity');
    this.scoreEl.setAttribute('position', '0 0.05 0.01');
    this.scoreEl.setAttribute('text', {
      value: 'PONTOS: 0',
      align: 'center',
      width: 5,
      color: '#ffffff',
      font: 'roboto'
    });

    // Pinos derrubados
    this.pinsEl = document.createElement('a-entity');
    this.pinsEl.setAttribute('position', '0 -0.2 0.01');
    this.pinsEl.setAttribute('text', {
      value: 'PINOS: 0 / 10',
      align: 'center',
      width: 4,
      color: '#ffcc00',
      font: 'roboto'
    });

    // Status do jogo
    this.statusEl = document.createElement('a-entity');
    this.statusEl.setAttribute('position', '0 -0.42 0.01');
    this.statusEl.setAttribute('text', {
      value: 'Pegue a bola e jogue!',
      align: 'center',
      width: 3.5,
      color: '#88ff88',
      font: 'roboto'
    });

    // Montar hierarquia da tela
    this.tvScreen.appendChild(this.titleEl);
    this.tvScreen.appendChild(this.scoreEl);
    this.tvScreen.appendChild(this.pinsEl);
    this.tvScreen.appendChild(this.statusEl);

    // Montar hierarquia da TV
    this.tvGroup.appendChild(this.ceilingMount);
    this.tvGroup.appendChild(this.mountPole);
    this.tvGroup.appendChild(this.tvBorder);
    this.tvGroup.appendChild(this.tvBody);
    this.tvGroup.appendChild(this.bottomBar);
    this.tvGroup.appendChild(this.screenGlow);
    this.tvGroup.appendChild(this.tvScreen);
    
    el.appendChild(this.tvGroup);

    // Estado do jogo
    this.score = 0;
    this.pinsKnocked = 0;
    this.totalPins = 10;
    this.frame = 1;
    this.throw = 1;

    // Detectar pinos após a cena carregar
    setTimeout(() => this.setupPinDetection(), 1500);

    // Atualizar placar inicial
    this.updateScoreboard();
    
    console.log('✅ Placar de boliche inicializado');
  },

  setupPinDetection: function () {
    const pinsContainer = document.querySelector('#pinos-container');

    if (!pinsContainer) {
      console.warn('⚠️ Container de pinos não encontrado');
      setTimeout(() => this.setupPinDetection(), 1000);
      return;
    }

    setTimeout(() => {
      const pins = pinsContainer.querySelectorAll('.pino');
      
      if (!pins || pins.length === 0) {
        console.warn('⚠️ Nenhum pino encontrado');
        setTimeout(() => this.setupPinDetection(), 1000);
        return;
      }

      console.log(`📌 ${pins.length} pinos encontrados`);

      this.pinPositions = [];

      pins.forEach((pin, i) => {
        const pos = pin.getAttribute('position');
        const initialPos = pos ? { x: pos.x, y: pos.y, z: pos.z } : { x: 0, y: 0.2, z: 0 };

        this.pinPositions[i] = {
          element: pin,
          initialY: initialPos.y,
          initialPos: initialPos,
          knocked: false
        };
      });

      this.totalPins = this.pinPositions.length;
      this.updateScoreboard();

      // Checar pinos a cada 100ms
      this.checkInterval = setInterval(() => this.checkAllPins(), 100);
    }, 500);
  },

  checkPinKnocked: function (index) {
    const data = this.pinPositions[index];
    if (!data || data.knocked) return;

    const pin = data.element;
    const currentPos = pin.getAttribute('position');
    const currentRot = pin.getAttribute('rotation');
    if (!currentPos) return;

    const yDiff = data.initialY - currentPos.y;
    const xDiff = Math.abs(data.initialPos.x - currentPos.x);
    const zDiff = Math.abs(data.initialPos.z - currentPos.z);
    
    // Verificar inclinação (rotação) - pino tombou
    let tilted = false;
    if (currentRot) {
      tilted = Math.abs(currentRot.x) > 25 || Math.abs(currentRot.z) > 25;
    }

    // Pino caiu se: desceu, moveu muito, ou inclinou muito
    if (yDiff > 0.08 || xDiff > 0.15 || zDiff > 0.15 || tilted) {
      data.knocked = true;
      this.pinsKnocked += 1;
      this.score += 1;

      this.updateScoreboard();
      console.log(`🎯 Pino ${index + 1} derrubado! Total: ${this.pinsKnocked}/${this.totalPins}`);

      // Verificar strike
      if (this.pinsKnocked === this.totalPins) {
        this.onStrike();
      }
    }
  },

  checkAllPins: function () {
    if (!this.pinPositions) return;

    for (let i = 0; i < this.pinPositions.length; i++) {
      if (!this.pinPositions[i].knocked) {
        this.checkPinKnocked(i);
      }
    }
  },

  onStrike: function () {
    console.log('🎳 STRIKE! 🎳');
    
    // Bônus de strike
    this.score += 10;
    
    // Atualizar status
    this.updateStatus('🎳 STRIKE! 🎳');
    
    // Piscar a tela
    this.flashScreen('#ffcc00');
    
    this.updateScoreboard();
  },

  flashScreen: function(color) {
    const originalColor = '#0d1b2a';
    this.tvScreen.setAttribute('material', 'color', color);
    
    setTimeout(() => {
      this.tvScreen.setAttribute('material', 'color', originalColor);
    }, 200);
    
    setTimeout(() => {
      this.tvScreen.setAttribute('material', 'color', color);
    }, 400);
    
    setTimeout(() => {
      this.tvScreen.setAttribute('material', 'color', originalColor);
    }, 600);
  },

  updateScoreboard: function () {
    if (this.scoreEl) {
      this.scoreEl.setAttribute('text', 'value', `PONTOS: ${this.score}`);
    }
    
    if (this.pinsEl) {
      this.pinsEl.setAttribute('text', 'value', `PINOS: ${this.pinsKnocked} / ${this.totalPins}`);
    }
  },

  updateStatus: function(message) {
    if (this.statusEl) {
      this.statusEl.setAttribute('text', 'value', message);
    }
  },

  reset: function () {
    this.score = 0;
    this.pinsKnocked = 0;
    this.frame = 1;
    this.throw = 1;

    if (this.pinPositions) {
      this.pinPositions.forEach(p => {
        p.knocked = false;
      });
    }
    
    this.updateScoreboard();
    this.updateStatus('Pegue a bola e jogue!');
    
    console.log('🔄 Placar resetado');
  },

  remove: function () {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
});

// Auto-criação do placar se não existir no HTML
(function() {
  function initScoreboard() {
    const existing = document.querySelector('[bowling-scoreboard]');
    if (existing) {
      console.log('✅ Placar já existe no HTML');
      return;
    }
    
    const scene = document.querySelector('a-scene');
    if (!scene) {
      setTimeout(initScoreboard, 100);
      return;
    }

    const scoreboardEntity = document.createElement('a-entity');
    scoreboardEntity.setAttribute('id', 'scoreboard');
    scoreboardEntity.setAttribute('bowling-scoreboard', '');
    scene.appendChild(scoreboardEntity);
    console.log('✅ Placar criado automaticamente');
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScoreboard);
  } else {
    setTimeout(initScoreboard, 500);
  }
})();
