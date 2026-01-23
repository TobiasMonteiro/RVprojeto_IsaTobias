/**
 * Setup automático das calhas de bowling
 * Adiciona a entidade bowling-gutters na cena via JavaScript
 */

(function() {
  'use strict';

  function setupGutters() {
    const scene = document.querySelector('a-scene');
    
    if (!scene) {
      // Se a cena ainda não carregou, tenta novamente
      setTimeout(setupGutters, 100);
      return;
    }

    // Aguarda a cena estar completamente carregada
    scene.addEventListener('loaded', function() {
      // Cria a entidade das calhas
      const guttersEntity = document.createElement('a-entity');
      guttersEntity.setAttribute('id', 'bowling-gutters');
      guttersEntity.setAttribute('bowling-gutters', {
        // Dimensões realistas de uma pista de bowling
        laneWidth: 1.05,        // largura da pista jogável (padrão oficial: 1.05m)
        gutterWidth: 0.23,       // largura de cada calha (padrão oficial: ~0.23m)
        gutterDepth: 0.08,       // profundidade da calha (rebaixada)
        wallHeight: 0.08,        // altura das paredes verticais
        length: 18.3,            // comprimento da pista (padrão oficial: 18.3m)
        
        // Posicionamento (ajuste conforme seu modelo GLTF)
        // Se sua pista estiver deslocada, ajuste estes valores
        centerX: 0,             // centro X da pista
        centerY: 0,             // altura Y da pista (onde a bola rola)
        centerZ: 0,             // centro Z da pista
        
        // Opções visuais
        visible: true,           // true = sempre visível (design moderno)
        enableLED: true,         // ativar iluminação LED azul nas bordas
        gutterColor: '#0a0a0a',  // cor escura do fundo (metal escuro)
        wallColor: '#1a1a1a',    // cor escura das paredes
        ledColor: '#00aaff'      // cor do LED azul
      });
      
      // Adiciona na cena
      scene.appendChild(guttersEntity);
      
      console.log('✅ Calhas de bowling criadas com sucesso!');
    });
  }

  // Inicia quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupGutters);
  } else {
    setupGutters();
  }
})();
