document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(['token', 'email'], function (data) {
        if (data.token && data.email) {
            window.location.href = 'plugin.html';
        }
    });
    const form = document.getElementById('settingsForm');
    if (form != null){
        form.addEventListener('submit', function (event) {
        event.preventDefault();
    
        const token = (document.getElementById('tokenInput') as HTMLInputElement).value;
        const email = (document.getElementById('emailInput') as HTMLInputElement).value;
        const projectUrl = (document.getElementById('projectUrlInput') as HTMLInputElement).value;
    
        chrome.storage.sync.set({
            token: token,
            email: email,
            projectUrl: projectUrl
        }, function () {
            window.location.href = 'plugin.html';
        });
        });
    }
  });
  