/**
 * Sistema de Interação do Boliche
 * - Componente bowling-cursor: controla o cursor e lançamento
 * - Componente ball-button: botão para pegar a bola
 * - Componente bowling-ball: configuração da bola
 */

(function() {
  // Aguardar A-Frame estar pronto
  function init() {
    if (typeof AFRAME === 'undefined') {
      setTimeout(init, 100);
      return;
    }
    registerComponents();
  }
  
  function registerComponents() {
    
    // ============================================================
    // COMPONENTE: direction-arrows
    // Mostra setas indicando a direção do lançamento
    // ============================================================
    AFRAME.registerComponent('direction-arrows', {
      init: function() {
        this.arrowsGroup = null;
        this.createArrows();
      },
      
      createArrows: function() {
        // Grupo de setas
        this.arrowsGroup = document.createElement('a-entity');
        this.arrowsGroup.setAttribute('id', 'direction-arrows-group');
        this.arrowsGroup.setAttribute('visible', 'false');
        
        // Seta principal (frente)
        const mainArrow = document.createElement('a-cone');
        mainArrow.setAttribute('radius-bottom', '0.15');
        mainArrow.setAttribute('radius-top', '0.01');
        mainArrow.setAttribute('height', '1.2');
        mainArrow.setAttribute('position', '0 0.6 0');
        mainArrow.setAttribute('rotation', '0 0 0');
        mainArrow.setAttribute('material', {
          color: '#4CC3D9',
          transparent: true,
          opacity: 0.8
        });
        
        // Setas laterais (indicam direção)
        const leftArrow = document.createElement('a-cone');
        leftArrow.setAttribute('radius-bottom', '0.08');
        leftArrow.setAttribute('radius-top', '0.01');
        leftArrow.setAttribute('height', '0.6');
        leftArrow.setAttribute('position', '-0.3 0.3 0');
        leftArrow.setAttribute('rotation', '0 0 0');
        leftArrow.setAttribute('material', {
          color: '#7FDBFF',
          transparent: true,
          opacity: 0.6
        });
        
        const rightArrow = document.createElement('a-cone');
        rightArrow.setAttribute('radius-bottom', '0.08');
        rightArrow.setAttribute('radius-top', '0.01');
        rightArrow.setAttribute('height', '0.6');
        rightArrow.setAttribute('position', '0.3 0.3 0');
        rightArrow.setAttribute('rotation', '0 0 0');
        rightArrow.setAttribute('material', {
          color: '#7FDBFF',
          transparent: true,
          opacity: 0.6
        });
        
        // Anel indicador de força
        const powerRing = document.createElement('a-torus');
        powerRing.setAttribute('radius', '0.25');
        powerRing.setAttribute('radius-tubular', '0.02');
        powerRing.setAttribute('position', '0 0.2 0');
        powerRing.setAttribute('rotation', '90 0 0');
        powerRing.setAttribute('material', {
          color: '#ffcc00',
          transparent: true,
          opacity: 0.5
        });
        powerRing.setAttribute('id', 'power-ring');
        
        this.arrowsGroup.appendChild(mainArrow);
        this.arrowsGroup.appendChild(leftArrow);
        this.arrowsGroup.appendChild(rightArrow);
        this.arrowsGroup.appendChild(powerRing);
        
        const scene = document.querySelector('a-scene');
        if (scene) {
          scene.appendChild(this.arrowsGroup);
        }
      },
      
      show: function(ballPosition) {
        if (!this.arrowsGroup) return;
        this.arrowsGroup.setAttribute('position', ballPosition);
        this.arrowsGroup.setAttribute('visible', 'true');
      },
      
      hide: function() {
        if (!this.arrowsGroup) return;
        this.arrowsGroup.setAttribute('visible', 'false');
      },
      
      updateDirection: function(direction) {
        if (!this.arrowsGroup) return;
        
        // Calcular rotação baseada na direção
        const angle = Math.atan2(direction.x, direction.z) * (180 / Math.PI);
        this.arrowsGroup.setAttribute('rotation', {
          x: 0,
          y: angle,
          z: 0
        });
      },
      
      updatePower: function(power) {
        if (!this.arrowsGroup) return;
        
        const powerRing = this.arrowsGroup.querySelector('#power-ring');
        if (powerRing) {
          // Escala do anel baseada na força
          const scale = 0.25 + (power * 0.15); // 0.25 a 0.4
          powerRing.setAttribute('radius', scale);
          
          // Cor muda com a força
          const color = power < 0.33 ? '#00ff88' : (power < 0.66 ? '#ffcc00' : '#ff4444');
          powerRing.setAttribute('material', 'color', color);
        }
      }
    });

    // ============================================================
    // COMPONENTE: bowling-cursor
    // Controla a interação do cursor com a bola
    // NOVO: Clique e segure para carregar força, solte para lançar
    // ============================================================
    AFRAME.registerComponent('bowling-cursor', {
      init: function () {
        this.isCharging = false;
        this.chargedBall = null;
        this.chargeStartTime = 0;
        this.throwPower = 0;
        this.direction = new THREE.Vector3(0, 0, -1);
        
        // Elementos UI
        this.powerIndicator = document.getElementById('power-indicator');
        this.powerBar = document.getElementById('power-bar');
        this.powerText = document.getElementById('power-text');
        
        // Componente de setas
        this.arrowsComponent = null;
        
        // Event listeners
        this.el.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.el.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // Listener global para quando soltar fora do cursor
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        console.log('✅ Cursor de boliche inicializado');
      },

      tick: function (time, deltaTime) {
        if (!this.isCharging || !this.chargedBall) return;
        
        // Manter a bola fixa durante o carregamento
        const body = this.chargedBall.components['dynamic-body'];
        if (body && body.body) {
          const currentPos = this.chargedBall.getAttribute('position');
          if (currentPos) {
            // Sincronizar posição física com visual
            body.body.position.set(currentPos.x, currentPos.y, currentPos.z);
            body.body.velocity.set(0, 0, 0);
            body.body.angularVelocity.set(0, 0, 0);
          }
        }
        
        // Calcular tempo de carregamento (usar performance.now() para precisão)
        const currentTime = performance.now();
        const holdTime = (currentTime - this.chargeStartTime) / 1000;
        
        // Força baseada no tempo (máximo 3 segundos = força máxima)
        // Tempos menores = menos força (mais devagar)
        this.throwPower = Math.min(holdTime / 3, 1); // 0 a 1
        
        // Obter direção atual da câmera
        const camera = document.querySelector('[camera]');
        if (camera) {
          const cameraObj = camera.object3D;
          const worldQuat = new THREE.Quaternion();
          cameraObj.getWorldQuaternion(worldQuat);
          
          const forward = new THREE.Vector3(0, 0, -1);
          forward.applyQuaternion(worldQuat);
          this.direction.copy(forward);
        }
        
        // Obter componente de setas se ainda não tiver
        if (!this.arrowsComponent) {
          const arrowsEntity = document.getElementById('direction-arrows-entity');
          if (arrowsEntity && arrowsEntity.components['direction-arrows']) {
            this.arrowsComponent = arrowsEntity.components['direction-arrows'];
          }
        }
        
        // Atualizar setas de direção
        if (this.arrowsComponent) {
          const ballPos = this.chargedBall.getAttribute('position');
          if (ballPos) {
            this.arrowsComponent.show(ballPos);
            this.arrowsComponent.updateDirection(this.direction);
            this.arrowsComponent.updatePower(this.throwPower);
          }
        }
        
        // Atualizar indicador de força
        this.updatePowerIndicator();
      },

      onMouseDown: function (evt) {
        if (this.isCharging) {
          console.log('⚠️ Já está carregando uma bola');
          return;
        }
        
        // Verificar se clicou na bola
        const raycaster = this.el.components.raycaster;
        if (!raycaster) {
          console.warn('⚠️ Raycaster não encontrado');
          return;
        }
        
        // Obter elementos intersectados
        const intersected = raycaster.intersectedEls || raycaster.intersectedObjects || [];
        let ball = null;
        
        console.log('🔍 Elementos intersectados:', intersected.length);
        
        // Procurar pela bola nos elementos intersectados
        for (let i = 0; i < intersected.length; i++) {
          const el = intersected[i];
          if (!el) continue;
          
          // Verificar por ID
          if (el.id === 'bola') {
            ball = el;
            console.log('✅ Bola encontrada por ID');
            break;
          }
          
          // Verificar por classe
          if (el.classList && el.classList.contains('bola')) {
            ball = el;
            console.log('✅ Bola encontrada por classe');
            break;
          }
          
          // Verificar se é o fallback
          if (el.id === 'bola-fallback') {
            // Encontrar a bola pai
            ball = document.getElementById('bola');
            if (ball) {
              console.log('✅ Bola encontrada via fallback');
              break;
            }
          }
          
          // Verificar se é filho da bola
          let parent = el.parentElement;
          while (parent) {
            if (parent.id === 'bola' || (parent.classList && parent.classList.contains('bola'))) {
              ball = parent;
              console.log('✅ Bola encontrada como pai');
              break;
            }
            parent = parent.parentElement;
          }
          if (ball) break;
        }
        
        // Se não encontrou, tentar buscar diretamente
        if (!ball) {
          ball = document.getElementById('bola');
          if (ball) {
            console.log('✅ Bola encontrada diretamente pelo ID');
          } else {
            console.warn('⚠️ Bola não encontrada nos elementos intersectados');
            // Log para debug
            intersected.forEach((el, idx) => {
              console.log(`  [${idx}] ID: ${el.id}, Classes: ${el.className || 'none'}`);
            });
          }
        }
        
        if (!ball) return;
        
        console.log('🎳 Iniciando carregamento da bola...');
        this.startCharging(ball);
      },

      startCharging: function(ball) {
        if (!ball) return;
        
        const body = ball.components['dynamic-body'];
        if (!body || !body.body) {
          console.warn('⚠️ Corpo físico da bola não encontrado');
          return;
        }
        
        this.chargedBall = ball;
        this.isCharging = true;
        this.chargeStartTime = performance.now();
        this.throwPower = 0;
        
        // Parar a bola (tornar kinematic) e manter posição atual
        const currentPos = ball.getAttribute('position');
        body.body.type = 2; // CANNON.Body.KINEMATIC
        body.body.velocity.set(0, 0, 0);
        body.body.angularVelocity.set(0, 0, 0);
        
        // Garantir que a posição física está sincronizada
        if (currentPos) {
          body.body.position.set(currentPos.x, currentPos.y, currentPos.z);
        }
        
        // Obter direção inicial
        const camera = document.querySelector('[camera]');
        if (camera) {
          const cameraObj = camera.object3D;
          const worldQuat = new THREE.Quaternion();
          cameraObj.getWorldQuaternion(worldQuat);
          
          const forward = new THREE.Vector3(0, 0, -1);
          forward.applyQuaternion(worldQuat);
          this.direction.copy(forward);
        }
        
        // Criar/obter componente de setas
        const scene = document.querySelector('a-scene');
        if (scene) {
          let arrowsEntity = document.getElementById('direction-arrows-entity');
          if (!arrowsEntity) {
            arrowsEntity = document.createElement('a-entity');
            arrowsEntity.setAttribute('id', 'direction-arrows-entity');
            arrowsEntity.setAttribute('direction-arrows', '');
            scene.appendChild(arrowsEntity);
            
            // Aguardar componente inicializar
            setTimeout(() => {
              if (arrowsEntity.components['direction-arrows']) {
                this.arrowsComponent = arrowsEntity.components['direction-arrows'];
              }
            }, 100);
          } else {
            // Componente já existe, obter diretamente
            if (arrowsEntity.components['direction-arrows']) {
              this.arrowsComponent = arrowsEntity.components['direction-arrows'];
            } else {
              // Aguardar componente inicializar
              setTimeout(() => {
                if (arrowsEntity.components['direction-arrows']) {
                  this.arrowsComponent = arrowsEntity.components['direction-arrows'];
                }
              }, 100);
            }
          }
        }
        
        // Mostrar indicador de força
        if (this.powerIndicator) {
          this.powerIndicator.style.display = 'block';
        }
        
        console.log('🎳 Bola preparada para lançamento! Segure para carregar força...');
      },

      onMouseUp: function (evt) {
        if (!this.isCharging || !this.chargedBall) return;
        
        const ball = this.chargedBall;
        const body = ball.components['dynamic-body'];
        
        if (body && body.body) {
          // Voltar para dinâmico
          body.body.type = 1; // CANNON.Body.DYNAMIC
          
          // Calcular força do lançamento
          // Tempos menores = menos força (mais devagar)
          // Força mínima: 2 (clique rápido)
          // Força máxima: 15 (3 segundos segurando)
          const minPower = 2;
          const maxPower = 15;
          const totalPower = minPower + (this.throwPower * (maxPower - minPower));
          
          // Aplicar velocidade na direção que está olhando
          const throwVel = this.direction.clone().multiplyScalar(totalPower);
          
          // Ajustar altura (um pouco para baixo para rolar na pista)
          throwVel.y = Math.max(throwVel.y * 0.3, -1);
          
          body.body.velocity.set(throwVel.x, throwVel.y, throwVel.z);
          
          // Rotação da bola (efeito de rotação)
          body.body.angularVelocity.set(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 2,
            this.direction.z * -8 // Rotação principal na direção do lançamento
          );
          
          console.log(`🎳 Bola lançada! Força: ${totalPower.toFixed(1)} (${Math.round(this.throwPower * 100)}% carregado)`);
        }
        
        // Esconder setas
        if (this.arrowsComponent) {
          this.arrowsComponent.hide();
        }
        
        // Esconder indicador de força
        if (this.powerIndicator) {
          this.powerIndicator.style.display = 'none';
        }
        
        this.isCharging = false;
        this.chargedBall = null;
        this.throwPower = 0;
      },
      
      updatePowerIndicator: function() {
        if (!this.powerBar || !this.powerText) return;
        
        const percentage = Math.round(this.throwPower * 100);
        this.powerBar.style.width = percentage + '%';
        this.powerText.textContent = `FORÇA: ${percentage}%`;
      }
    });

    // ============================================================
    // COMPONENTE: ball-button
    // Botão para teleportar a bola para a mão do jogador
    // ============================================================
    AFRAME.registerComponent('ball-button', {
      init: function () {
        this.el.addEventListener('click', this.onClick.bind(this));
        this.el.addEventListener('mouseenter', this.onHover.bind(this));
        this.el.addEventListener('mouseleave', this.onLeave.bind(this));
        
        this.originalColor = '#4CC3D9';
        this.hoverColor = '#7FDBFF';
        this.clickColor = '#01FF70';
        
        console.log('✅ Botão da bola inicializado');
      },
      
      onClick: function() {
        // Feedback visual
        this.el.setAttribute('material', 'color', this.clickColor);
        setTimeout(() => {
          this.el.setAttribute('material', 'color', this.originalColor);
        }, 200);
        
        // Encontrar a bola
        const ball = document.getElementById('bola');
        if (!ball) {
          console.warn('⚠️ Bola não encontrada');
          return;
        }
        
        // Encontrar o cursor com o componente bowling-cursor
        const cursor = document.querySelector('[bowling-cursor]');
        if (cursor && cursor.components['bowling-cursor']) {
          // Teleportar bola para posição inicial e depois agarrar
          const body = ball.components['dynamic-body'];
          if (body && body.body) {
            // Primeiro, resetar a bola para uma posição próxima do jogador
            const player = document.getElementById('player');
            if (player) {
              const playerPos = player.getAttribute('position');
              const newPos = {
                x: playerPos.x,
                y: playerPos.y + 1.2,
                z: playerPos.z - 1
              };
              
              body.body.velocity.set(0, 0, 0);
              body.body.angularVelocity.set(0, 0, 0);
              body.body.position.set(newPos.x, newPos.y, newPos.z);
              ball.setAttribute('position', newPos);
            }
            
            // Preparar a bola para lançamento automaticamente
            cursor.components['bowling-cursor'].startCharging(ball);
          }
        }
        
        console.log('🎳 Bola teletransportada para o jogador!');
      },
      
      onHover: function() {
        this.el.setAttribute('material', 'color', this.hoverColor);
        this.el.setAttribute('scale', '1.1 1.1 1.1');
      },
      
      onLeave: function() {
        this.el.setAttribute('material', 'color', this.originalColor);
        this.el.setAttribute('scale', '1 1 1');
      }
    });

    // ============================================================
    // COMPONENTE: bowling-ball
    // Configuração e comportamento da bola
    // ============================================================
    AFRAME.registerComponent('bowling-ball', {
      init: function () {
        this.el.classList.add('bola');
        this.el.classList.add('interactive');
        
        // Adicionar evento de clique direto na bola
        this.el.addEventListener('click', (evt) => {
          console.log('🎳 Clique direto na bola detectado!');
          const cursor = document.querySelector('[bowling-cursor]');
          if (cursor && cursor.components['bowling-cursor']) {
            cursor.components['bowling-cursor'].startCharging(this.el);
          }
        });
        
        // Verificar se modelo carregou
        this.el.addEventListener('model-loaded', () => {
          console.log('✅ Modelo da bola carregado');
          
          // Manter fallback visível mas transparente para garantir clique
          const fallback = this.el.querySelector('#bola-fallback');
          if (fallback) {
            fallback.setAttribute('material', 'opacity', '0.3');
            fallback.setAttribute('visible', 'true');
            // Adicionar clique também no fallback
            fallback.addEventListener('click', (evt) => {
              console.log('🎳 Clique no fallback da bola detectado!');
              const cursor = document.querySelector('[bowling-cursor]');
              if (cursor && cursor.components['bowling-cursor']) {
                cursor.components['bowling-cursor'].startCharging(this.el);
              }
            });
          }
        });
        
        this.el.addEventListener('model-error', () => {
          console.warn('⚠️ Erro ao carregar modelo da bola, usando fallback');
          const fallback = this.el.querySelector('#bola-fallback');
          if (fallback) {
            fallback.setAttribute('material', 'opacity', '1');
            fallback.setAttribute('visible', 'true');
          }
        });
        
        // Garantir que o fallback seja sempre clicável
        setTimeout(() => {
          const fallback = this.el.querySelector('#bola-fallback');
          if (fallback) {
            fallback.classList.add('bola', 'interactive');
            // Adicionar evento de clique no fallback
            fallback.addEventListener('click', (evt) => {
              console.log('🎳 Clique no fallback da bola detectado!');
              const cursor = document.querySelector('[bowling-cursor]');
              if (cursor && cursor.components['bowling-cursor']) {
                cursor.components['bowling-cursor'].startCharging(this.el);
              }
            });
            console.log('✅ Fallback da bola configurado para clique');
          }
        }, 500);
        
        // Detectar quando a bola cai fora da pista
        this.checkBoundaries = this.checkBoundaries.bind(this);
        this.boundaryCheckInterval = setInterval(this.checkBoundaries, 1000);
        
        console.log('✅ Bola de boliche inicializada');
      },
      
      checkBoundaries: function() {
        const pos = this.el.getAttribute('position');
        if (!pos) return;
        
        // Se a bola caiu muito (abaixo de Y = -5) ou foi muito longe
        if (pos.y < -5 || Math.abs(pos.x) > 15 || pos.z < -25 || pos.z > 20) {
          console.log('🔄 Bola fora dos limites, resetando posição...');
          
          const body = this.el.components['dynamic-body'];
          if (body && body.body) {
            body.body.velocity.set(0, 0, 0);
            body.body.angularVelocity.set(0, 0, 0);
            body.body.position.set(0, 0.3, 3);
          }
          this.el.setAttribute('position', '0 0.3 3');
        }
      },
      
      remove: function() {
        if (this.boundaryCheckInterval) {
          clearInterval(this.boundaryCheckInterval);
        }
      }
    });

    // ============================================================
    // COMPONENTE: bowling-pin
    // Configura física realista para os pinos
    // ============================================================
    AFRAME.registerComponent('bowling-pin', {
      init: function() {
        this.el.classList.add('pino');
        this.isKnocked = false;
        this.initialPosition = null;
        this.initialRotation = null;
        
        // Guardar posição inicial após física inicializar
        setTimeout(() => {
          const pos = this.el.getAttribute('position');
          const rot = this.el.getAttribute('rotation');
          if (pos) {
            this.initialPosition = { x: pos.x, y: pos.y, z: pos.z };
          }
          if (rot) {
            this.initialRotation = { x: rot.x, y: rot.y, z: rot.z };
          }
          console.log(`📌 Pino ${this.el.id} inicializado em`, this.initialPosition);
        }, 1000);
        
        // Ouvir evento de colisão
        this.el.addEventListener('collide', (evt) => {
          const impactVelocity = evt.detail.contact ? evt.detail.contact.getImpactVelocityAlongNormal() : 0;
          
          // Se impacto forte o suficiente, marcar como derrubado
          if (Math.abs(impactVelocity) > 2 && !this.isKnocked) {
            console.log(`💥 Pino ${this.el.id} atingido! Impacto: ${impactVelocity.toFixed(2)}`);
          }
        });
      },
      
      tick: function() {
        if (!this.initialPosition || this.isKnocked) return;
        
        // Verificar se o pino caiu
        const pos = this.el.getAttribute('position');
        const rot = this.el.getAttribute('rotation');
        
        if (!pos) return;
        
        // Verificar deslocamento ou inclinação
        const yDiff = this.initialPosition.y - pos.y;
        const xDiff = Math.abs(this.initialPosition.x - pos.x);
        const zDiff = Math.abs(this.initialPosition.z - pos.z);
        
        // Verificar inclinação (rotação)
        let tilted = false;
        if (rot) {
          tilted = Math.abs(rot.x) > 30 || Math.abs(rot.z) > 30;
        }
        
        // Pino caiu se: desceu muito, moveu muito, ou inclinou muito
        if (yDiff > 0.1 || xDiff > 0.2 || zDiff > 0.2 || tilted) {
          this.isKnocked = true;
          console.log(`🎯 Pino ${this.el.id} derrubado!`);
          this.el.emit('pin-knocked', { id: this.el.id });
        }
      },
      
      // Método para resetar o pino
      reset: function() {
        if (!this.initialPosition) return;
        
        this.isKnocked = false;
        
        const body = this.el.components['dynamic-body'];
        if (body && body.body) {
          body.body.velocity.set(0, 0, 0);
          body.body.angularVelocity.set(0, 0, 0);
          body.body.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);
          body.body.quaternion.set(0, 0, 0, 1);
        }
        
        this.el.setAttribute('position', this.initialPosition);
        this.el.setAttribute('rotation', this.initialRotation || { x: 0, y: 0, z: 0 });
      }
    });

    // ============================================================
    // COMPONENTE: pin-monitor (opcional para debug)
    // Monitora estado dos pinos
    // ============================================================
    AFRAME.registerComponent('pin-monitor', {
      init: function() {
        this.initialPosition = null;
        this.isKnocked = false;
        
        // Aguardar posição inicial ser definida
        setTimeout(() => {
          this.initialPosition = this.el.getAttribute('position');
          if (this.initialPosition) {
            this.initialPosition = {...this.initialPosition};
          }
        }, 500);
      },
      
      tick: function() {
        if (!this.initialPosition || this.isKnocked) return;
        
        const currentPos = this.el.getAttribute('position');
        if (!currentPos) return;
        
        const yDiff = this.initialPosition.y - currentPos.y;
        const xDiff = Math.abs(this.initialPosition.x - currentPos.x);
        const zDiff = Math.abs(this.initialPosition.z - currentPos.z);
        
        if (yDiff > 0.15 || xDiff > 0.3 || zDiff > 0.3) {
          this.isKnocked = true;
          // Emitir evento de pino derrubado
          this.el.emit('pin-knocked', { element: this.el });
        }
      }
    });

    // ============================================================
    // COMPONENTE: vr-ball-grabber
    // Permite pegar e jogar a bola com as mãos em VR
    // ============================================================
    AFRAME.registerComponent('vr-ball-grabber', {
      schema: {
        hand: { type: 'string', default: 'right' }, // 'left' ou 'right'
        grabDistance: { type: 'number', default: 0.5 }, // Distância máxima para pegar (metros)
        throwMultiplier: { type: 'number', default: 8 } // Multiplicador de força do lançamento
      },
      
      init: function() {
        this.ball = null;
        this.isGrabbing = false;
        this.grabStartTime = 0;
        this.throwPower = 0;
        this.handPosition = new THREE.Vector3();
        this.handVelocity = new THREE.Vector3();
        this.lastHandPosition = new THREE.Vector3();
        this.lastHandPosition.set(0, 0, 0); // Inicializar para evitar problemas
        
        // Verificar se está em modo VR
        this.scene = this.el.sceneEl;
        this.checkVRMode();
        
        // Listener para quando entrar em VR
        this.scene.addEventListener('enter-vr', () => {
          this.isVR = true;
          console.log(`🥽 Modo VR ativado para mão ${this.data.hand}!`);
        });
        
        this.scene.addEventListener('exit-vr', () => {
          this.isVR = false;
          this.releaseBall();
          console.log(`🖥️ Modo VR desativado para mão ${this.data.hand}`);
        });
        
        // Verificar periodicamente se entrou em VR (fallback)
        this.vrCheckInterval = setInterval(() => {
          this.checkVRMode();
        }, 1000);
        
        // Event listeners para botões do controller
        // Trigger (botão principal) - pegar/soltar
        this.el.addEventListener('triggerdown', this.onTriggerDown.bind(this));
        this.el.addEventListener('triggerup', this.onTriggerUp.bind(this));
        this.el.addEventListener('buttondown', this.onTriggerDown.bind(this)); // Alternativa
        this.el.addEventListener('buttonup', this.onTriggerUp.bind(this)); // Alternativa
        
        // Grip (botão de agarrar) - alternativa
        this.el.addEventListener('gripdown', this.onGripDown.bind(this));
        this.el.addEventListener('gripup', this.onGripUp.bind(this));
        
        // Para hand tracking (sem botões físicos)
        this.el.addEventListener('pinchstarted', this.onPinchStart.bind(this));
        this.el.addEventListener('pinchended', this.onPinchEnd.bind(this));
        this.el.addEventListener('thumbstickdown', this.onTriggerDown.bind(this)); // Para alguns controllers
        
        console.log(`✅ VR Ball Grabber inicializado para mão ${this.data.hand}`);
      },
      
      checkVRMode: function() {
        // Verificar se está em VR através da API do A-Frame
        if (this.scene && this.scene.is('vr-mode')) {
          if (!this.isVR) {
            this.isVR = true;
            console.log(`🥽 Detectado modo VR para mão ${this.data.hand}`);
          }
        } else {
          if (this.isVR) {
            this.isVR = false;
            this.releaseBall();
            console.log(`🖥️ Saiu do modo VR para mão ${this.data.hand}`);
          }
        }
      },
      
      tick: function(time, deltaTime) {
        // Verificar modo VR periodicamente
        if (time % 1000 < deltaTime) {
          this.checkVRMode();
        }
        
        if (!this.isVR) return;
        
        // Atualizar posição da mão
        const handObj = this.el.object3D;
        if (handObj) {
          handObj.getWorldPosition(this.handPosition);
          
          // Calcular velocidade da mão (para lançamento)
          if (this.lastHandPosition.length() > 0 && this.lastHandPosition.x !== 0) {
            this.handVelocity.subVectors(this.handPosition, this.lastHandPosition);
            this.handVelocity.multiplyScalar(60 / (deltaTime || 16.67)); // Converter para unidades por segundo
          } else {
            this.handVelocity.set(0, 0, 0);
          }
          this.lastHandPosition.copy(this.handPosition);
        }
        
        // Se está segurando a bola, atualizar posição
        if (this.isGrabbing && this.ball) {
          this.updateBallPosition();
          
          // Calcular força baseada no tempo segurando
          const holdTime = (time - this.grabStartTime) / 1000;
          this.throwPower = Math.min(holdTime / 2, 1); // Máximo em 2 segundos
        } else {
          // Verificar se está perto da bola para poder pegar
          this.checkBallProximity();
        }
      },
      
      checkBallProximity: function() {
        if (this.isGrabbing || !this.ball) {
          // Encontrar a bola se ainda não tiver
          this.ball = document.getElementById('bola');
          if (!this.ball) return;
        }
        
        const ballPos = this.ball.getAttribute('position');
        if (!ballPos) return;
        
        const ballVec = new THREE.Vector3(ballPos.x, ballPos.y, ballPos.z);
        const distance = this.handPosition.distanceTo(ballVec);
        
        // Se está perto o suficiente, mostrar feedback visual (opcional)
        if (distance < this.data.grabDistance) {
          // A bola pode mudar de cor ou mostrar indicador
          // Por enquanto, apenas log
        }
      },
      
      onTriggerDown: function() {
        if (!this.isVR) return;
        this.attemptGrab();
      },
      
      onTriggerUp: function() {
        if (!this.isVR) return;
        this.releaseBall();
      },
      
      onGripDown: function() {
        if (!this.isVR) return;
        this.attemptGrab();
      },
      
      onGripUp: function() {
        if (!this.isVR) return;
        this.releaseBall();
      },
      
      onPinchStart: function() {
        if (!this.isVR) return;
        this.attemptGrab();
      },
      
      onPinchEnd: function() {
        if (!this.isVR) return;
        this.releaseBall();
      },
      
      attemptGrab: function() {
        if (this.isGrabbing) return; // Já está segurando algo
        
        // Encontrar a bola
        if (!this.ball) {
          this.ball = document.getElementById('bola');
        }
        
        if (!this.ball) {
          console.warn('⚠️ Bola não encontrada');
          return;
        }
        
        const ballPos = this.ball.getAttribute('position');
        if (!ballPos) return;
        
        const ballVec = new THREE.Vector3(ballPos.x, ballPos.y, ballPos.z);
        const distance = this.handPosition.distanceTo(ballVec);
        
        // Verificar se está perto o suficiente
        if (distance > this.data.grabDistance) {
          console.log(`⚠️ Muito longe da bola (${distance.toFixed(2)}m > ${this.data.grabDistance}m)`);
          return;
        }
        
        // Pegar a bola!
        this.grabBall();
      },
      
      grabBall: function() {
        if (!this.ball) return;
        
        const body = this.ball.components['dynamic-body'];
        if (!body || !body.body) {
          console.warn('⚠️ Corpo físico da bola não encontrado');
          return;
        }
        
        this.isGrabbing = true;
        this.grabStartTime = performance.now();
        this.throwPower = 0;
        
        // Tornar a bola kinematic (controlada pela mão)
        body.body.type = 2; // CANNON.Body.KINEMATIC
        body.body.velocity.set(0, 0, 0);
        body.body.angularVelocity.set(0, 0, 0);
        
        // Posicionar a bola na mão
        this.updateBallPosition();
        
        console.log(`✋ Bola agarrada com mão ${this.data.hand}!`);
      },
      
      updateBallPosition: function() {
        if (!this.ball || !this.isGrabbing) return;
        
        // Posicionar a bola ligeiramente à frente da mão
        const handObj = this.el.object3D;
        if (!handObj) return;
        
        // Obter direção da mão (forward)
        const forward = new THREE.Vector3(0, 0, -1);
        const handQuat = new THREE.Quaternion();
        handObj.getWorldQuaternion(handQuat);
        forward.applyQuaternion(handQuat);
        
        // Posição da bola: mão + um pouco à frente
        const ballOffset = forward.multiplyScalar(0.15); // 15cm à frente
        const ballPosition = this.handPosition.clone().add(ballOffset);
        
        // Ajustar altura (manter um pouco abaixo da mão para parecer natural)
        ballPosition.y -= 0.1;
        
        // Atualizar posição física e visual
        const body = this.ball.components['dynamic-body'];
        if (body && body.body) {
          body.body.position.set(ballPosition.x, ballPosition.y, ballPosition.z);
        }
        this.ball.setAttribute('position', ballPosition);
      },
      
      releaseBall: function() {
        if (!this.isGrabbing || !this.ball) return;
        
        const body = this.ball.components['dynamic-body'];
        if (!body || !body.body) return;
        
        // Voltar para dinâmico
        body.body.type = 1; // CANNON.Body.DYNAMIC
        
        // Calcular velocidade de lançamento baseada na velocidade da mão
        const throwVel = this.handVelocity.clone();
        
        // Aplicar multiplicador de força
        const powerMultiplier = 1 + (this.throwPower * (this.data.throwMultiplier - 1));
        throwVel.multiplyScalar(powerMultiplier);
        
        // Ajustar direção (um pouco para baixo para rolar na pista)
        throwVel.y = Math.max(throwVel.y * 0.4, -2);
        
        // Se a velocidade for muito baixa, usar direção da mão
        if (throwVel.length() < 1) {
          const handObj = this.el.object3D;
          if (handObj) {
            const forward = new THREE.Vector3(0, 0, -1);
            const handQuat = new THREE.Quaternion();
            handObj.getWorldQuaternion(handQuat);
            forward.applyQuaternion(handQuat);
            throwVel.copy(forward.multiplyScalar(5 + (this.throwPower * 10)));
            throwVel.y = Math.max(throwVel.y * 0.3, -1);
          }
        }
        
        body.body.velocity.set(throwVel.x, throwVel.y, throwVel.z);
        
        // Rotação da bola (efeito de rotação)
        const angularVel = throwVel.length() * 2;
        body.body.angularVelocity.set(
          (Math.random() - 0.5) * angularVel * 0.5,
          (Math.random() - 0.5) * angularVel * 0.5,
          throwVel.z * -3
        );
        
        console.log(`🎳 Bola lançada! Força: ${throwVel.length().toFixed(1)}, Power: ${Math.round(this.throwPower * 100)}%`);
        
        // Resetar estado
        this.isGrabbing = false;
        this.throwPower = 0;
        this.handVelocity.set(0, 0, 0);
      },
      
      remove: function() {
        // Limpar intervalos
        if (this.vrCheckInterval) {
          clearInterval(this.vrCheckInterval);
        }
        // Soltar bola se estiver segurando
        this.releaseBall();
      }
    });
    
    console.log('✅ Componentes de boliche registrados');
  }
  
  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
