(() => {
  if (!navigator.serviceWorker) return;

  // register service worker, handle service worker updates
  navigator.serviceWorker.register('../sw.js').then((reg) => {
    if (!navigator.serviceWorker.controller) {
      return;
    }

    if (reg.waiting) {
      _updateReady(reg.waiting);
      return;
    }

    if (reg.installing) {
      _trackInstalling(reg.installing);
      return;
    }

    reg.addEventListener('updatefound', () => {
      _trackInstalling(reg.installing);
    });
  });

  // reload page after service worker that controls the page changed
  let refreshing;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    window.location.reload();
    refreshing = true;
  });

  // handle state changes of service worker
  const _trackInstalling = (worker) => {
    worker.addEventListener('statechange', () => {
      if (worker.state == 'installed') {
        _updateReady(worker);
      }
    });
  };

  // show panel to let the user react on app updates
  const _updateReady = (worker) => {
    const body = document.querySelector('body');
    body.insertAdjacentElement('afterbegin', _createUpdatePanel(worker));
  };

  // create update panel
  const _createUpdatePanel = (worker) => {
    const panel = document.createElement('div');
    panel.classList.add('update-panel');
    panel.setAttribute('id', 'update-panel');
    panel.setAttribute('role', 'alert');
    panel.setAttribute('aria-labelledby', 'update-panel-header');

    const header = document.createElement('h3');
    header.setAttribute('id', 'update-panel-header');
    header.innerHTML = 'New version of Restaurant Review is available';

    const refreshButton = document.createElement('button');
    refreshButton.innerHTML = 'refresh to update';
    refreshButton.addEventListener('click', _createUpdateHandler(worker));

    const dismissButton = document.createElement('button');
    dismissButton.innerHTML = 'dismiss updating';
    dismissButton.addEventListener('click', _dismissHandler);

    panel.appendChild(header);
    panel.appendChild(refreshButton);
    panel.appendChild(dismissButton);
    return panel;
  }

  // create function for handling request for app update
  const _createUpdateHandler = (worker) => {
    return () => {
      worker.postMessage({action: 'skipWaiting'});
      document.querySelector('#update-panel').remove();
    }
  }

  // function for handling app update ignoring
  const _dismissHandler = () => {
    document.querySelector('#update-panel').remove();
  }
})();
