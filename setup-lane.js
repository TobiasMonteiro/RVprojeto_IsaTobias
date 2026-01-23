/**
 * Setup automático dos colisores da pista de bowling
 * Adiciona a entidade bowling-lane-colliders na cena via JavaScript
 * 
 * IMPORTANTE: Este script cria APENAS os colisores físicos.
 * O visual das calhas (se necessário) deve ser criado separadamente.
 */

(function() {
  'use strict';

  function setupLaneColliders() {
    const scene = document.querySelector('a-scene');
    
    if (!scene) {
      // Se a cena ainda não carregou, tenta novamente
      setTimeout(setupLaneColliders, 100);
      return;
    }

    // Aguarda a cena estar completamente carregada
    scene.addEventListener('loaded', function() {
      // Cria a entidade dos colisores da pista
      const laneCollidersEntity = document.createElement('a-entity');
      laneCollidersEntity.setAttribute('id', 'bowling-lane-colliders');
      laneCollidersEntity.setAttribute('bowling-lane-colliders', {
        // Dimensões realistas de uma pista de bowling oficial
        laneWidth: 1.05,        // largura da pista jogável (padrão oficial: 1.05m)
        gutterWidth: 0.23,      // largura de cada calha (padrão oficial: ~0.23m)
        gutterDepth: 0.08,      // profundidade da calha (quanto mais baixa que a pista)
        wallHeight: 0.12,       // altura das paredes (deve ser > gutterDepth para funcionar)
        length: 18.3,           // comprimento da pista (padrão oficial: 18.3m)
        
        // Posicionamento (ajuste conforme seu modelo GLTF)
        // IMPORTANTE: Estes valores devem corresponder à posição real da sua pista
        centerX: 0,            // centro X da pista (ajuste se sua pista estiver deslocada)
        centerY: 0,             // altura Y da pista (onde a bola rola - ajuste conforme necessário)
        centerZ: 0,             // centro Z da pista (ajuste se sua pista estiver deslocada)
        
        // Opções de debug
        visible: false,          // false = invisível (apenas física), true = visível (debug)
        color: '#ff0000',        // cor dos colisores quando visíveis (vermelho para debug)
        opacity: 0.3             // opacidade quando visíveis (0.3 = semi-transparente)
      });
      
      // Adiciona na cena
      scene.appendChild(laneCollidersEntity);
      
      console.log('✅ Colisores da pista de bowling criados com sucesso!');
      console.log('   - Pista central: altura Y =', laneCollidersEntity.getAttribute('bowling-lane-colliders').centerY);
      console.log('   - Calhas: altura Y =', laneCollidersEntity.getAttribute('bowling-lane-colliders').centerY - laneCollidersEntity.getAttribute('bowling-lane-colliders').gutterDepth);
    });
  }

  // Inicia quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLaneColliders);
  } else {
    setupLaneColliders();
  }
})();
