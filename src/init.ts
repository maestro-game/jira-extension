chrome.runtime.onInstalled.addListener(function () {
    // Установка начальных значений в хранилище
    chrome.storage.sync.set({
      token: '',
      email: '',
      projectUrl: ''
    }, function () {
      console.log('Инициализация данных');
    });
  });