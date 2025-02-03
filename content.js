// 성능 최적화를 위한 디바운스 함수
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 더 효율적인 선택자 사용과 캐싱
const hideShortsContent = debounce(() => {
  // Shorts 섹션 숨기기
  document.querySelectorAll('ytd-rich-section-renderer').forEach(element => {
    if (element.querySelector('#contents.ytd-rich-section-renderer ytd-reel-shelf-renderer')) {
      element.style.display = 'none';
    }
  });

  // reel-shelf-renderer 숨기기
  document.querySelectorAll('ytd-reel-shelf-renderer.style-scope').forEach(element => {
    element.style.display = 'none';
  });

  // rich-shelf-renderer의 Shorts 섹션 숨기기
  document.querySelectorAll('div#dismissible.style-scope.ytd-rich-shelf-renderer').forEach(element => {
    const titleSpan = element.querySelector('span#title');
    if (titleSpan?.textContent.includes('Shorts')) {
      element.style.display = 'none';
    }
  });

  // Shorts 칩 숨기기
  document.querySelectorAll('yt-chip-cloud-chip-renderer').forEach(element => {
    const textSpan = element.querySelector('span#text, yt-formatted-string#text');
    if (textSpan?.textContent.includes('Shorts')) {
      element.style.display = 'none';
    }
  });
}, 100);

// 옵저버 최적화
const observer = new MutationObserver((mutations) => {
  // 변경사항이 있을 때만 실행
  const hasRelevantChanges = mutations.some(mutation => {
    return Array.from(mutation.addedNodes).some(node => {
      return node.nodeType === 1 && (
        node.querySelector('ytd-reel-shelf-renderer') ||
        node.querySelector('span#title') ||
        node.tagName === 'YT-CHIP-CLOUD-CHIP-RENDERER'
      );
    });
  });

  if (hasRelevantChanges) {
    hideShortsContent();
  }
});

// 옵저버 설정 최적화
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
});

// 초기 실행
hideShortsContent(); 