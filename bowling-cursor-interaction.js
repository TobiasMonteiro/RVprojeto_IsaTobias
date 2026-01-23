/**
 * Componente A-Frame: bowling-cursor-interaction
 * Melhora a interação do cursor com a bola de boliche
 * Permite pegar, segurar e lançar a bola com física realista
 */

AFRAME.registerComponent('bowling-cursor-interaction', {
  schema: {
    throwForce: { type: 'number', default: 15 },      // força do lançamento
    maxThrowForce: { type: 'number', default: 30 },   // força máxima
    grabDistance: { type: 'number', default: 0.5 },    // distância máxima para pegar
    releaseDelay: { type: 'number', default: 50 }      // delay em ms para ativar física após soltar
  },

  init: function () {
    const cursor = this.el;
    const data = this.data;
    
    // Estado da interação
    this.grabbedObject = null;
    this.grabOffset = new THREE.Vector3();
    this.previousPosition = new THREE.Vector3();
    this.currentPosition = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.isGrabbing = false;
    this.lastIntersection = null;
    
    // Referência ao cursor (raycaster)
    this.raycaster = cursor.components.raycaster;
    
    // Event listeners - usar eventos do A-Frame
    cursor.addEventListener('mousedown', this.onGrab.bind(this));
    cursor.addEventListener('mouseup', this.onRelease.bind(this));
    cursor.addEventListener('click', this.onGrab.bind(this));
    cursor.addEventListener('raycaster-intersection', this.onIntersection.bind(this));
    cursor.addEventListener('raycaster-intersection-cleared', this.onIntersectionCleared.bind(this));
    
    // Para VR/touch
    cursor.addEventListener('touchstart', this.onGrab.bind(this));
    cursor.addEventListener('touchend', this.onRelease.bind(this));
    
    // Atualizar posição do cursor a cada frame
    this.tick = this.tick.bind(this);
  },
  
  /**
   * Quando o raycaster detecta uma interseção
   */
  onIntersection: function (evt) {
    const intersection = evt.detail.els[0];
    if (intersection) {
      this.lastIntersection = intersection;
    }
  },
  
  /**
   * Quando o raycaster deixa de detectar uma interseção
   */
  onIntersectionCleared: function (evt) {
    // Não fazer nada aqui, manter lastIntersection até próxima interseção
  },

  tick: function (time, deltaTime) {
    if (!this.isGrabbing || !this.grabbedObject) return;
    
    // Obter posição atual do cursor no mundo 3D
    const cursorWorldPos = this.getCursorWorldPosition();
    
    if (!cursorWorldPos) return;
    
    // Calcular velocidade baseada no movimento
    this.velocity.subVectors(cursorWorldPos, this.previousPosition);
    this.velocity.multiplyScalar(1000 / deltaTime); // normalizar por deltaTime
    
    // Atualizar posição da bola para seguir o cursor
    const targetPos = cursorWorldPos.clone().add(this.grabOffset);
    this.grabbedObject.setAttribute('position', {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z
    });
    
    // Guardar posição anterior
    this.previousPosition.copy(cursorWorldPos);
  },

  /**
   * Obtém a posição 3D do cursor no mundo
   */
  getCursorWorldPosition: function () {
    const cursor = this.el;
    const camera = cursor.closestEl('a-camera') || document.querySelector('[camera]');
    
    if (!camera) return null;
    
    // Obter direção do raycaster
    const raycaster = cursor.components.raycaster;
    if (!raycaster || !raycaster.raycaster) {
      // Fallback: usar posição da câmera + direção forward
      const camera = cursor.closestEl('a-camera') || document.querySelector('[camera]');
      if (camera) {
        const cameraPos = camera.getAttribute('position');
        const cameraRot = camera.getAttribute('rotation');
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            THREE.MathUtils.degToRad(cameraRot.x),
            THREE.MathUtils.degToRad(cameraRot.y),
            THREE.MathUtils.degToRad(cameraRot.z),
            'XYZ'
          )
        ));
        return new THREE.Vector3(
          cameraPos.x + forward.x * this.data.grabDistance,
          cameraPos.y + forward.y * this.data.grabDistance,
          cameraPos.z + forward.z * this.data.grabDistance
        );
      }
      return null;
    }
    
    const ray = raycaster.raycaster.ray;
    const distance = this.data.grabDistance;
    
    // Calcular posição no mundo baseada na direção do raio
    const worldPos = ray.origin.clone().add(ray.direction.clone().multiplyScalar(distance));
    
    return worldPos;
  },

  /**
   * Quando o usuário pressiona o botão (pegar)
   */
  onGrab: function (evt) {
    if (this.isGrabbing) return;
    
    const cursor = this.el;
    const raycaster = cursor.components.raycaster;
    
    if (!raycaster) return;
    
    // Tentar usar a última interseção detectada
    let ball = this.lastIntersection;
    
    // Se não tiver, tentar obter das interseções atuais
    if (!ball) {
      const intersections = raycaster.intersections || raycaster.intersectedEls || [];
      
      if (intersections && intersections.length > 0) {
        // Procurar pela bola nas interseções
        for (let i = 0; i < intersections.length; i++) {
          let obj = intersections[i];
          
          // Se for um objeto Three.js, pegar o elemento A-Frame
          if (obj && obj.el) {
            obj = obj.el;
          }
          
          if (!obj || !obj.getAttribute) continue;
          
          // Verificar se tem o modelo da bola
          const gltfModel = obj.getAttribute('gltf-model');
          if (gltfModel && gltfModel === '#bolaModel') {
            ball = obj;
            break;
          }
          
          // Verificar se está na classe "bolas"
          if (obj.classList && obj.classList.contains('bolas')) {
            ball = obj;
            break;
          }
          
          // Verificar se tem mixin "bola"
          const mixin = obj.getAttribute('mixin');
          if (mixin && (mixin === 'bola' || mixin.includes('bola'))) {
            ball = obj;
            break;
          }
        }
      }
    }
    
    if (!ball) return;
    
    // Verificar se realmente é a bola (verificar se tem dynamic-body)
    if (!ball.components || !ball.components['dynamic-body']) {
      return;
    }
    
    // Pegar a bola
    this.grabbedObject = ball;
    this.isGrabbing = true;
    
    // Desativar física temporariamente
    const dynamicBody = ball.components['dynamic-body'];
    if (dynamicBody && dynamicBody.body) {
      dynamicBody.body.type = 'kinematic'; // tipo kinematic = não afetado por física, mas pode colidir
      dynamicBody.body.velocity.set(0, 0, 0);
      dynamicBody.body.angularVelocity.set(0, 0, 0);
    }
    
    // Calcular offset (distância entre cursor e centro da bola)
    const cursorWorldPos = this.getCursorWorldPosition();
    if (cursorWorldPos) {
      const ballPos = ball.getAttribute('position');
      this.grabOffset = new THREE.Vector3(
        ballPos.x - cursorWorldPos.x,
        ballPos.y - cursorWorldPos.y,
        ballPos.z - cursorWorldPos.z
      );
      this.previousPosition.copy(cursorWorldPos);
    }
    
    // Feedback visual (opcional - pode adicionar efeito de "selecionado")
    ball.setAttribute('animation__grab', {
      property: 'scale',
      to: '1.1 1.1 1.1',
      dur: 200,
      easing: 'easeOutQuad'
    });
    
    console.log('🎳 Bola agarrada!');
  },

  /**
   * Quando o usuário solta o botão (lançar)
   */
  onRelease: function (evt) {
    if (!this.isGrabbing || !this.grabbedObject) return;
    
    const ball = this.grabbedObject;
    
    // Reativar física
    const dynamicBody = ball.components['dynamic-body'];
    if (dynamicBody && dynamicBody.body) {
      // Voltar para tipo dinâmico
      dynamicBody.body.type = 'dynamic';
      
      // Aplicar velocidade baseada no movimento do cursor
      const velocity = this.velocity.clone();
      
      // Limitar velocidade máxima
      const speed = velocity.length();
      if (speed > this.data.maxThrowForce) {
        velocity.normalize().multiplyScalar(this.data.maxThrowForce);
      }
      
      // Aplicar força do lançamento (ajustar multiplicador para melhor controle)
      velocity.multiplyScalar(this.data.throwForce / 50); // ajustado para melhor resposta
      
      // Aplicar velocidade
      dynamicBody.body.velocity.set(velocity.x, velocity.y, velocity.z);
      
      // Adicionar rotação baseada na direção do movimento para realismo
      if (speed > 0.1) {
        const rotationFactor = Math.min(speed / 10, 3); // limitar rotação
        dynamicBody.body.angularVelocity.set(
          velocity.y * rotationFactor * 0.5,
          -velocity.x * rotationFactor * 0.5,
          (Math.random() - 0.5) * rotationFactor
        );
      } else {
        // Rotação aleatória mínima se não houver movimento significativo
        dynamicBody.body.angularVelocity.set(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        );
      }
    }
    
    // Feedback visual
    ball.setAttribute('animation__release', {
      property: 'scale',
      to: '1 1 1',
      dur: 200,
      easing: 'easeOutQuad'
    });
    
    // Limpar estado
    this.grabbedObject = null;
    this.isGrabbing = false;
    this.velocity.set(0, 0, 0);
    
    console.log('🎳 Bola lançada! Velocidade:', this.velocity);
  },

  remove: function () {
    // Limpar event listeners
    const cursor = this.el;
    cursor.removeEventListener('mousedown', this.onGrab);
    cursor.removeEventListener('mouseup', this.onRelease);
    cursor.removeEventListener('click', this.onGrab);
    cursor.removeEventListener('raycaster-intersection', this.onIntersection);
    cursor.removeEventListener('raycaster-intersection-cleared', this.onIntersectionCleared);
    cursor.removeEventListener('touchstart', this.onGrab);
    cursor.removeEventListener('touchend', this.onRelease);
  }
});
