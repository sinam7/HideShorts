// Shorts 콘텐츠를 주기적으로 확인하고 숨김
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      hideShortsContent();
    }
  });
});

function hideShortsContent() {
  // 추가적인 Shorts 관련 요소들을 동적으로 숨김
  const shortsElements = document.querySelectorAll('ytd-rich-section-renderer');
  shortsElements.forEach(element => {
    if (element.querySelector('#contents.ytd-rich-section-renderer ytd-reel-shelf-renderer')) {
      element.style.display = 'none';
    }
  });

  // Shorts 제목을 가진 rich-shelf-renderer 숨기기
  const richShelfElements = document.querySelectorAll('div#dismissible.style-scope.ytd-rich-shelf-renderer');
  richShelfElements.forEach(element => {
    const titleSpan = element.querySelector('span#title.style-scope.ytd-rich-shelf-renderer');
    if (titleSpan && titleSpan.innerHTML.includes('Shorts')) {
      element.style.display = 'none';
    }
  });
}

// 페이지의 변경사항을 관찰
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// 초기 실행
hideShortsContent(); 