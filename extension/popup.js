document.addEventListener('DOMContentLoaded', () => {
  const toggleSwitch = document.getElementById('toggle-switch');

  chrome.storage.sync.get(['previewEnabled'], (result) => {
      toggleSwitch.checked = result.previewEnabled !== false; // default to true if undefined
  });

  toggleSwitch.addEventListener('change', () => {
      const isEnabled = toggleSwitch.checked;
      chrome.storage.sync.set({ previewEnabled: isEnabled }, () => {
          console.log(`Preview is ${isEnabled ? 'enabled' : 'disabled'}`);
      });
  });
});