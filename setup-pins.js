/**
 * Setup automático dos pinos de bowling
 * Cria 10 pinos em formação triangular padrão
 */

(function() {
  'use strict';

  function setupPins() {
    const pinsContainer = document.querySelector('.pinos');
    
    if (!pinsContainer) {
      // Se o container ainda não existe, tenta novamente
      setTimeout(setupPins, 100);
      return;
    }

    // Verificar se os pinos já foram criados
    if (pinsContainer.children.length > 0) {
      console.log('✅ Pinos já existem:', pinsContainer.children.length);
      return;
    }

    // Formação triangular padrão de bowling (10 pinos)
    // Linha 1 (frente): 1 pino
    // Linha 2: 2 pinos
    // Linha 3: 3 pinos
    // Linha 4 (trás): 4 pinos
    
    const pinSpacing = 0.3; // espaçamento entre pinos (em metros)
    const rowSpacing = 0.26; // espaçamento entre linhas (em metros)
    
    // Posição inicial (frente da formação)
    const startX = 0; // centro
    const startY = 0.4; // altura do pino (ajuste conforme necessário)
    const startZ = -15; // distância da câmera (ajuste conforme necessário)
    
    const pinPositions = [
      // Linha 1 (frente) - 1 pino
      { row: 1, pos: 0, x: startX, z: startZ },
      
      // Linha 2 - 2 pinos
      { row: 2, pos: 0, x: startX - pinSpacing / 2, z: startZ - rowSpacing },
      { row: 2, pos: 1, x: startX + pinSpacing / 2, z: startZ - rowSpacing },
      
      // Linha 3 - 3 pinos
      { row: 3, pos: 0, x: startX - pinSpacing, z: startZ - rowSpacing * 2 },
      { row: 3, pos: 1, x: startX, z: startZ - rowSpacing * 2 },
      { row: 3, pos: 2, x: startX + pinSpacing, z: startZ - rowSpacing * 2 },
      
      // Linha 4 (trás) - 4 pinos
      { row: 4, pos: 0, x: startX - pinSpacing * 1.5, z: startZ - rowSpacing * 3 },
      { row: 4, pos: 1, x: startX - pinSpacing * 0.5, z: startZ - rowSpacing * 3 },
      { row: 4, pos: 2, x: startX + pinSpacing * 0.5, z: startZ - rowSpacing * 3 },
      { row: 4, pos: 3, x: startX + pinSpacing * 1.5, z: startZ - rowSpacing * 3 }
    ];
    
    // Criar cada pino
    pinPositions.forEach((pinData, index) => {
      const pin = document.createElement('a-entity');
      pin.setAttribute('mixin', 'pino');
      pin.setAttribute('position', {
        x: pinData.x,
        y: startY,
        z: pinData.z
      });
      pin.setAttribute('id', `pino-${index + 1}`);
      pin.setAttribute('data-pin-number', index + 1);
      
      // Adicionar ao container
      pinsContainer.appendChild(pin);
    });
    
    console.log(`✅ ${pinPositions.length} pinos criados em formação triangular!`);
  }

  // Aguardar a cena carregar
  const scene = document.querySelector('a-scene');
  if (scene) {
    scene.addEventListener('loaded', function() {
      setTimeout(setupPins, 500); // dar tempo para os mixins carregarem
    });
  } else {
    // Se a cena ainda não existe, tentar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(setupPins, 1000);
      });
    } else {
      setTimeout(setupPins, 1000);
    }
  }
})();
