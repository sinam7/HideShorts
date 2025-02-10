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

// 로그 헬퍼 함수
function log(message, ...args) {
  console.log(`[HideShorts] ${message}`, ...args);
}

// 더 효율적인 선택자 사용과 캐싱
const hideShortsContent = debounce(() => {
  log('숨기기 함수 실행');
  let hiddenCount = 0;

  // Shorts 섹션 숨기기
  document.querySelectorAll('ytd-rich-section-renderer').forEach(element => {
    if (element.querySelector('#contents.ytd-rich-section-renderer ytd-reel-shelf-renderer')) {
      element.style.display = 'none';
      hiddenCount++;
    }
  });

  // reel-shelf-renderer 숨기기
  document.querySelectorAll('ytd-reel-shelf-renderer.style-scope').forEach(element => {
    element.style.display = 'none';
    hiddenCount++;
  });

  // rich-shelf-renderer의 Shorts 섹션 숨기기
  document.querySelectorAll('div#dismissible.style-scope.ytd-rich-shelf-renderer').forEach(element => {
    const titleSpan = element.querySelector('span#title');
    if (titleSpan?.textContent.includes('Shorts')) {
      element.style.display = 'none';
      hiddenCount++;
    }
  });

  // Shorts 칩 숨기기 - 더 강력한 선택자 사용
  document.querySelectorAll([
    'yt-chip-cloud-chip-renderer',
    'ytd-feed-filter-chip-bar-renderer yt-chip-cloud-chip-renderer'
  ].join(',')).forEach(element => {
    const textSpan = element.querySelector('span#text, yt-formatted-string#text');
    if (textSpan?.textContent.includes('Shorts')) {
      element.style.display = 'none';
      hiddenCount++;
    }
  });

  if (hiddenCount > 0) {
    log(`${hiddenCount}개의 Shorts 요소를 숨겼습니다.`);
  }
}, 100);

// 초기 로드 시 여러 번 시도
function initialHideAttempt(retryCount = 0, maxRetries = 5) {
  log(`초기화 시도 ${retryCount + 1}/${maxRetries + 1}`);
  hideShortsContent();
  
  // 페이지가 완전히 로드되었는지 확인 - 더 포괄적인 체크
  const shortsElements = document.querySelectorAll([
    'yt-chip-cloud-chip-renderer',
    'ytd-rich-section-renderer',
    'ytd-reel-shelf-renderer',
    'div#dismissible.style-scope.ytd-rich-shelf-renderer'
  ].join(','));

  log(`발견된 Shorts 관련 요소: ${shortsElements.length}개`);

  // 모든 타겟 요소가 없을 때만 재시도
  if (shortsElements.length === 0 && retryCount < maxRetries) {
    const delay = Math.min(500 * Math.pow(1.5, retryCount), 2000);
    log(`${delay}ms 후 재시도`);
    setTimeout(() => {
      initialHideAttempt(retryCount + 1, maxRetries);
    }, delay);
  }
}

// DOM 변경 감지를 위한 옵저버
const observer = new MutationObserver((mutations) => {
  const hasRelevantChanges = mutations.some(mutation => {
    return Array.from(mutation.addedNodes).some(node => {
      return node.nodeType === 1 && (
        node.querySelector('ytd-reel-shelf-renderer') ||
        node.querySelector('span#title') ||
        node.tagName === 'YT-CHIP-CLOUD-CHIP-RENDERER' ||
        node.querySelector('yt-chip-cloud-chip-renderer')
      );
    });
  });

  if (hasRelevantChanges) {
    log('DOM 변경 감지됨');
    hideShortsContent();
  }
});

function initializeObserver() {
  log('초기화 시작');
  initialHideAttempt();
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
  log('옵저버 설정 완료');
}

if (document.readyState === 'loading') {
  log('DOMContentLoaded 대기 중');
  document.addEventListener('DOMContentLoaded', initializeObserver);
} else {
  log('문서 이미 로드됨');
  initializeObserver();
} 