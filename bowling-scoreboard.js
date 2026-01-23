AFRAME.registerComponent('bowling-scoreboard', {
    schema: {
      // posição fixa (igual ao print que você mostrou no inspector)
      position: { type: 'vec3', default: { x: -0.025, y: 1.901, z: -4.217 } },
      rotation: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
  
      fontSize: { type: 'number', default: 0.4 },
      color: { type: 'string', default: '#FFFFFF' },
  
      // painel
      panelWidth: { type: 'number', default: 4 },
      panelHeight: { type: 'number', default: 1.5 },
      panelColor: { type: 'string', default: '#1a1a1a' },
      panelOpacity: { type: 'number', default: 0.9 },
  
      // borda
      borderColor: { type: 'string', default: '#FFD700' },
      borderOpacity: { type: 'number', default: 0.6 }
    },
  
    init: function () {
      const el = this.el;
      const data = this.data;
  
      // ======= POSIÇÃO / ROTAÇÃO (TV no teto, menor e profissional) =======
      el.setAttribute('position', { x: 0, y: 2.55, z: -0.8 }); // mais baixo que o teto
      el.setAttribute('rotation', { x: -8, y: 0, z: 0 });      // leve inclinação para a pista

      // um "grupo" para organizar tudo
      this.tvGroup = document.createElement('a-entity');
      this.tvGroup.setAttribute('position', '0 0 0');

      // ======= SUPORTE NO TETO =======
      // barra curta de fixação no teto
      this.ceilingMount = document.createElement('a-box');
      this.ceilingMount.setAttribute('width', 0.45);
      this.ceilingMount.setAttribute('height', 0.06);
      this.ceilingMount.setAttribute('depth', 0.25);
      this.ceilingMount.setAttribute('position', '0 0.40 0');
      this.ceilingMount.setAttribute('material', {
        color: '#222',
        metalness: 0.6,
        roughness: 0.3
      });

      // haste vertical (segurando a TV)
      this.mountPole = document.createElement('a-cylinder');
      this.mountPole.setAttribute('radius', 0.03);
      this.mountPole.setAttribute('height', 0.55);
      this.mountPole.setAttribute('position', '0 0.12 0');
      this.mountPole.setAttribute('material', {
        color: '#1a1a1a',
        metalness: 0.7,
        roughness: 0.25
      });

      // ======= CORPO DA TV (moldura) =======
      this.tvBody = document.createElement('a-box');
      this.tvBody.setAttribute('width', 2.35);     // menor (profissional)
      this.tvBody.setAttribute('height', 0.85);
      this.tvBody.setAttribute('depth', 0.12);
      this.tvBody.setAttribute('position', '0 -0.25 0');
      this.tvBody.setAttribute('material', {
        color: '#0f0f10',
        metalness: 0.2,
        roughness: 0.55
      });

      // barra inferior (tipo "soundbar"/acabamento)
      this.bottomBar = document.createElement('a-box');
      this.bottomBar.setAttribute('width', 2.35);
      this.bottomBar.setAttribute('height', 0.08);
      this.bottomBar.setAttribute('depth', 0.13);
      this.bottomBar.setAttribute('position', '0 -0.67 0');
      this.bottomBar.setAttribute('material', {
        color: '#141414',
        metalness: 0.35,
        roughness: 0.4
      });

      // ======= TELA (com brilho de TV ligada) =======
      this.tvScreen = document.createElement('a-plane');
      this.tvScreen.setAttribute('width', 2.18);
      this.tvScreen.setAttribute('height', 0.73);
      this.tvScreen.setAttribute('position', '0 -0.25 0.066'); // frente do body
      this.tvScreen.setAttribute('material', {
        color: '#000',
        shader: 'flat',
        transparent: true,
        opacity: 1
      });

      // um "glow" suave atrás da tela (dá cara de painel ligado)
      this.screenGlow = document.createElement('a-plane');
      this.screenGlow.setAttribute('width', 2.22);
      this.screenGlow.setAttribute('height', 0.77);
      this.screenGlow.setAttribute('position', '0 -0.25 0.062');
      this.screenGlow.setAttribute('material', {
        color: '#0b1a2a',      // brilho azulado leve
        shader: 'flat',
        transparent: true,
        opacity: 0.25
      });

      // ======= TEXTO NA TELA =======
      this.textEl = document.createElement('a-entity');
      this.textEl.setAttribute('position', '0 0 0.01'); // dentro da tela
      this.textEl.setAttribute('text', {
        value: 'PLACAR: 0\nPINOS: 0/10',
        align: 'center',
        width: 4.6,
        color: '#ffffff',
        font: 'roboto',
        baseline: 'center',
        lineHeight: 60
      });
      this.textEl.setAttribute('scale', '1 1 1');

      // montar hierarquia
      this.tvScreen.appendChild(this.textEl);
      this.tvGroup.appendChild(this.ceilingMount);
      this.tvGroup.appendChild(this.mountPole);
      this.tvGroup.appendChild(this.tvBody);
      this.tvGroup.appendChild(this.bottomBar);
      this.tvGroup.appendChild(this.screenGlow);
      this.tvGroup.appendChild(this.tvScreen);
      el.appendChild(this.tvGroup);
  
      // contadores
      this.score = 0;
      this.pinsKnocked = 0;
      this.totalPins = 10;
  
      // esperar cena carregar e detectar pinos
      setTimeout(() => this.setupPinDetection(), 1000);
  
      // texto inicial
      this.updateScoreboard();
    },
  
    setupPinDetection: function () {
      const pinsContainer = document.querySelector('.pinos');
  
      if (!pinsContainer) {
        console.warn('Placar: Container de pinos (.pinos) não encontrado.');
        return;
      }
  
      // dar tempo para os pinos serem criados
      setTimeout(() => {
        const pins = pinsContainer.children;
        this.pinPositions = [];
  
        for (let i = 0; i < pins.length; i++) {
          const pin = pins[i];
          const initialPos = pin.getAttribute('position') || { x: 0, y: 0, z: 0 };
  
          this.pinPositions[i] = {
            element: pin,
            initialY: initialPos.y || 0,
            initialPos: initialPos,
            knocked: false
          };
        }
  
        this.totalPins = this.pinPositions.length;
        this.updateScoreboard();
  
        // checar pinos
        this.checkInterval = setInterval(() => this.checkAllPins(), 100);
      }, 500);
    },
  
    checkPinKnocked: function (index) {
      const data = this.pinPositions[index];
      if (!data || data.knocked) return;
  
      const pin = data.element;
      const currentPos = pin.getAttribute('position') || { x: 0, y: 0, z: 0 };
  
      const yDiff = data.initialY - currentPos.y;
      const xDiff = Math.abs((data.initialPos.x || 0) - (currentPos.x || 0));
      const zDiff = Math.abs((data.initialPos.z || 0) - (currentPos.z || 0));
  
      // caiu ou foi muito deslocado
      if (yDiff > 0.2 || xDiff > 0.5 || zDiff > 0.5) {
        data.knocked = true;
        this.pinsKnocked += 1;
        this.score += 1;
  
        this.updateScoreboard();
        console.log(`Pino ${index + 1} derrubado! Total: ${this.pinsKnocked}`);
      }
    },
  
    checkAllPins: function () {
      if (!this.pinPositions) return;
  
      for (let i = 0; i < this.pinPositions.length; i++) {
        if (!this.pinPositions[i].knocked) this.checkPinKnocked(i);
      }
    },
  
    updateScoreboard: function () {
      if (!this.textEl) return;
      const text = `PLACAR: ${this.score}\nPINOS: ${this.pinsKnocked}/${this.totalPins}`;
      this.textEl.setAttribute('text', 'value', text);
    },
  
    reset: function () {
      this.score = 0;
      this.pinsKnocked = 0;
  
      if (this.pinPositions) {
        this.pinPositions.forEach(p => (p.knocked = false));
      }
      this.updateScoreboard();
    },
  
    remove: function () {
      if (this.checkInterval) clearInterval(this.checkInterval);
    }
  });
  
  // Cria o placar automaticamente quando a cena carregar
  document.addEventListener('DOMContentLoaded', function () {
    function createScoreboard() {
      const scene = document.querySelector('a-scene');
      if (!scene) {
        setTimeout(createScoreboard, 100);
        return;
      }
  
      setTimeout(() => {
        const scoreboardEntity = document.createElement('a-entity');
        scoreboardEntity.setAttribute('id', 'scoreboard');
        scoreboardEntity.setAttribute('bowling-scoreboard', ''); // usa defaults
        scene.appendChild(scoreboardEntity);
      }, 500);
    }
  
    createScoreboard();
  });
  