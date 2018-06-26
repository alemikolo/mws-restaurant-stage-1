(() => {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('../sw.js');
})();