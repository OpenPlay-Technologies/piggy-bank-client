// Get the iframe element
const iframe = document.getElementById('gameIframe') as HTMLIFrameElement;

// When the iframe is loaded, send an initial message to the game
iframe.onload = () => {
  iframe.contentWindow?.postMessage(
    { type: 'INIT', payload: 'Hello from Host' },
    '*' // For testing; in production, use the exact origin for security
  );
};

// Listen for messages coming from the game iframe
window.addEventListener('message', (event) => {
  // Optionally, verify event.origin in production
  console.log('Host received:', event.data);

  // Process game messages here (e.g., transaction requests, verification)
});
