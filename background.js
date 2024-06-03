// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "fetchHtmlFile") {
//     const { owner, repo, path } = request;
//     const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

//     fetch(url, {
//       headers: {
//         'Accept': 'application/vnd.github.v3.raw'
//       }
//     })
//     .then(response => response.text())
//     .then(data => {
//       sendResponse({ content: data });
//     })
//     .catch(error => {
//       console.error("Error fetching HTML file:", error);
//       sendResponse({ error: "Failed to fetch HTML file" });
//     });

//     return true; 
//   }
// });
