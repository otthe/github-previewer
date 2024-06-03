function addButtons() {
  const fileElements = document.querySelectorAll('div.react-directory-filename-column h3 a[title$=".html"]');

  fileElements.forEach(fileElement => {
    if (!fileElement.parentElement.querySelector('.ls-button')) {
      const button = document.createElement('button');
      button.innerText = 'Preview';
      button.className = 'ls-button button-3';
      button.style.marginLeft = '10px';

      fileElement.parentElement.appendChild(button);

      button.addEventListener('click', async () => {
        const fileUrl = fileElement.href.replace('/blob/', '/raw/');
        try {
          const response = await fetch(fileUrl);
          const htmlContent = await response.text();
          
          const newTab = window.open();
          newTab.document.open();
          newTab.document.write(htmlContent);
          newTab.document.close();

          await inlineResources(newTab, fileUrl);

        } catch (error) {
          console.error('Error fetching the HTML file:', error);
          alert('Failed to fetch the HTML file.');
        }
      });
    }
  });
}

async function inlineResources(newTab, fileUrl) {
  const baseUrl = fileUrl.substring(0, fileUrl.lastIndexOf('/'));

  // update base URL for relative paths
  const baseElement = newTab.document.createElement('base');
  baseElement.href = baseUrl + '/';
  newTab.document.head.appendChild(baseElement);

  // Inline styles
  const linkTags = Array.from(newTab.document.querySelectorAll('link[rel="stylesheet"]'));
  for (const tag of linkTags) {
    const cssUrl = new URL(tag.href, baseUrl).href;
    try {
      const response = await fetch(cssUrl);
      const cssContent = await response.text();
      const styleElement = newTab.document.createElement('style');
      styleElement.textContent = cssContent;
      tag.parentNode.replaceChild(styleElement, tag);
    } catch (error) {
      console.error('Error fetching CSS:', error);
    }
  }

  // Inline scripts and ensure they execute in order
  const scriptTags = Array.from(newTab.document.querySelectorAll('script'));
  for (const tag of scriptTags) {
    if (tag.src) {
      const scriptUrl = new URL(tag.src, baseUrl).href;
      try {
        const response = await fetch(scriptUrl);
        const scriptContent = await response.text();
        const inlineScript = newTab.document.createElement('script');
        inlineScript.textContent = scriptContent;
        tag.parentNode.replaceChild(inlineScript, tag);
        // Execute the script immediately
        newTab.eval(inlineScript.textContent);
      } catch (error) {
        console.error('Error fetching script:', error);
      }
    } else {
      // Execute inline scripts immediately
      newTab.eval(tag.textContent);
    }
  }

  // Fix image paths
  const imgTags = Array.from(newTab.document.querySelectorAll('img'));
  for (const tag of imgTags) {
    const imgUrl = new URL(tag.src, baseUrl).href;
    tag.src = imgUrl;
  }

  // re-execute inline scripts to ensure they run correctly
  reexecuteScripts(newTab);
}

function reexecuteScripts(newTab) {
  const scriptTags = Array.from(newTab.document.querySelectorAll('script'));
  scriptTags.forEach(scriptTag => {
    const newScriptTag = newTab.document.createElement('script');
    if (scriptTag.src) {
      newScriptTag.src = scriptTag.src;
    } else {
      newScriptTag.textContent = scriptTag.textContent;
    }
    scriptTag.parentNode.replaceChild(newScriptTag, scriptTag);
  });
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



// function addButtons() {
//   const fileElements = document.querySelectorAll('div.react-directory-filename-column h3 a[title$=".html"]');

//   fileElements.forEach(fileElement => {
//     if (!fileElement.parentElement.querySelector('.ls-button')) {
//       const button = document.createElement('button');
//       button.innerText = 'Preview';
//       button.className = 'ls-button button-3';
//       button.style.marginLeft = '10px';

//       fileElement.parentElement.appendChild(button);

//       button.addEventListener('click', async () => {
//         const fileUrl = fileElement.href.replace('/blob/', '/raw/');
//         try {
//           const response = await fetch(fileUrl);
//           const htmlContent = await response.text();
          
//           const newTab = window.open();
//           newTab.document.open();
//           newTab.document.write(htmlContent);
//           newTab.document.close();

//           // Handle linked resources
//           await inlineResources(newTab, fileUrl);

//         } catch (error) {
//           console.error('Error fetching the HTML file:', error);
//           alert('Failed to fetch the HTML file.');
//         }
//       });
//     }
//   });
// }

// async function inlineResources(newTab, fileUrl) {
//   const baseUrl = fileUrl.substring(0, fileUrl.lastIndexOf('/'));

//   // Update base URL for relative paths
//   const baseElement = newTab.document.createElement('base');
//   baseElement.href = baseUrl + '/';
//   newTab.document.head.appendChild(baseElement);

//   // Inline styles
//   const linkTags = Array.from(newTab.document.querySelectorAll('link[rel="stylesheet"]'));
//   for (const tag of linkTags) {
//     const cssUrl = new URL(tag.href, baseUrl).href;
//     try {
//       const response = await fetch(cssUrl);
//       const cssContent = await response.text();
//       const styleElement = newTab.document.createElement('style');
//       styleElement.textContent = cssContent;
//       tag.parentNode.replaceChild(styleElement, tag);
//     } catch (error) {
//       console.error('Error fetching CSS:', error);
//     }
//   }

//   // Inline scripts
//   const scriptTags = Array.from(newTab.document.querySelectorAll('script'));
//   for (const tag of scriptTags) {
//     if (tag.src) {
//       const scriptUrl = new URL(tag.src, baseUrl).href;
//       try {
//         const response = await fetch(scriptUrl);
//         const scriptContent = await response.text();
//         const inlineScript = newTab.document.createElement('script');
//         inlineScript.textContent = scriptContent;
//         tag.parentNode.replaceChild(inlineScript, tag);
//       } catch (error) {
//         console.error('Error fetching script:', error);
//       }
//     }
//   }

//   // Fix image paths
//   const imgTags = Array.from(newTab.document.querySelectorAll('img'));
//   for (const tag of imgTags) {
//     const imgUrl = new URL(tag.src, baseUrl).href;
//     tag.src = imgUrl;
//   }
// }

// function observeDOMChanges() {
//   const observer = new MutationObserver(addButtons);

//   observer.observe(document.body, {
//     childList: true,
//     subtree: true
//   });

//   addButtons();
// }

// observeDOMChanges();