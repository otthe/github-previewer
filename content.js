async function inlineResources(newTab, fileUrl) {
  const baseUrl = fileUrl.substring(0, fileUrl.lastIndexOf('/'));

  setBaseUrl(newTab, baseUrl);

  try {
    await Promise.all([
      inlineStyles(newTab, baseUrl),
      inlineImages(newTab, baseUrl)
    ]);
  } catch (error) {
    console.error('Error inlining resources:', error);
  }
}

function setBaseUrl(newTab, baseUrl) {
  const baseElement = newTab.document.createElement('base');
  baseElement.href = baseUrl + '/';
  newTab.document.head.appendChild(baseElement);
}

async function inlineStyles(newTab, baseUrl) {
  const linkTags = Array.from(newTab.document.querySelectorAll('link[rel="stylesheet"]'));
  const fetchCssPromises = linkTags.map(tag => fetchAndInlineStyle(tag, baseUrl));
  await Promise.all(fetchCssPromises);
}

async function fetchAndInlineStyle(tag, baseUrl) {
  const cssUrl = new URL(tag.href, baseUrl).href;
  try {
    const response = await fetch(cssUrl);
    if (!response.ok) throw new Error(`Failed to fetch CSS: ${response.statusText}`);
    const cssContent = await response.text();
    const styleElement = document.createElement('style');
    styleElement.textContent = cssContent;
    tag.parentNode.replaceChild(styleElement, tag);
  } catch (error) {
    console.error(`Error fetching CSS from ${cssUrl}:`, error);
  }
}

async function inlineImages(newTab, baseUrl) {
  const imgTags = Array.from(newTab.document.querySelectorAll('img'));
  imgTags.forEach(tag => {
    const imgUrl = new URL(tag.src, baseUrl).href;
    tag.src = imgUrl;
  });
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'error-notification';
  notification.innerText = message;
  
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

function addButtons() {
  const fileElements = document.querySelectorAll('div.react-directory-filename-column h3 a[title$=".html"]');

  fileElements.forEach(fileElement => {
    if (!fileElement.parentElement.querySelector('.ls-button')) {
      const button = document.createElement('button');
      button.innerText = '< Preview >';
      button.className = 'ls-button button-3';
      button.style.marginLeft = '10px';

      fileElement.parentElement.appendChild(button);

      button.addEventListener('click', async () => {
        const fileUrl = fileElement.href.replace('/blob/', '/raw/');
        try {
          const response = await fetch(fileUrl);
          const htmlContent = await response.text();
          
          const sanitizedHtmlContent = removeScriptTags(htmlContent);

          const newTab = window.open();
          newTab.document.open();
          newTab.document.write(sanitizedHtmlContent);
          newTab.document.close();

          await inlineResources(newTab, fileUrl);
        } catch (error) {
          showNotification('Failed to fetch the HTML file');
        }
      });
    }
  });
}

function removeScriptTags(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const scripts = doc.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  return doc.documentElement.outerHTML;
}

function observeDOMChanges() {
  const observer = new MutationObserver(addButtons);

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  addButtons();
}

observeDOMChanges();