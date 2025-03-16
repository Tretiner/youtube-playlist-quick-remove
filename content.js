const injectedButtons = new WeakSet();

const style = document.createElement('style');
style.textContent = `
  ytd-menu-renderer .ytd-playlist-video-renderer {
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  flex-direction: row;
  }

  .wl-ex-remove-video-button {
    border: none;
    background: none;
    padding: 8px;
    border-radius: 50%;
    cursor: pointer;
  }
  
  .wl-ex-remove-video-button svg {
    width: 22px;
    height: 22px;
    fill: var(--yt-spec-text-primary);
  }
`;
document.head.appendChild(style);

const removeButtonContentHtml = `
<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;">
  <path d="M11 17H9V8h2v9zm4-9h-2v9h2V8zm4-4v1h-1v16H6V5H5V4h4V3h6v1h4zm-2 1H7v15h10V5z"></path>
</svg>
`

function createButton() {
  const button = document.createElement('button');
  button.className = 'wl-ex-remove-video-button';
  button.innerHTML = removeButtonContentHtml;

  button.onclick = async (e) => {
    e.stopPropagation();
    const menuButton = e.target.closest('ytd-playlist-video-renderer').querySelector('button.yt-icon-button');

    if (menuButton) {
      menuButton.click();

      setTimeout(() => {
        let removeVideoIcon = document.querySelector("ytd-menu-popup-renderer tp-yt-paper-listbox path[d='M11 17H9V8h2v9zm4-9h-2v9h2V8zm4-4v1h-1v16H6V5H5V4h4V3h6v1h4zm-2 1H7v15h10V5z']");
        let removeVideoButton = removeVideoIcon.closest("ytd-menu-service-item-renderer");
        // let removeVideoButton = document.querySelector("ytd-menu-popup-renderer tp-yt-paper-listbox ytd-menu-service-item-renderer:nth-child(3)");
        removeVideoButton.click();
      }, 100);
    }
  };

  return button;
}

function tryAddButtonToRenderer(renderer) {
  const menuContainer = renderer.querySelector('#menu ytd-menu-renderer');
  if (menuContainer && !injectedButtons.has(renderer)) {
    menuContainer.prepend(createButton());
    injectedButtons.add(renderer);
  }
}

// Initial setup
document.addEventListener('yt-navigate-finish', () => {
  console.log("YT Playlists: Quick remove launched")

  setTimeout(() => resume(), 1500);
  function resume() {
    document
      .querySelectorAll('ytd-playlist-video-renderer')
      .forEach((renderer) => tryAddButtonToRenderer(renderer));

    // Observe added videos
    const loadedVideosObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes
          .forEach((node) => {
            if (node.nodeType === 1 && node.matches?.('ytd-playlist-video-renderer')) {
              tryAddButtonToRenderer(node);
            }
          });
      });
    });

    loadedVideosObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
});
