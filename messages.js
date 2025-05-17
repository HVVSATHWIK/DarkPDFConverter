/**
 * Displays a message to the user.
 * @param {string} message - The message to display.
 * @param {string} [type='info'] - The type of message ('info', 'error', etc.).
 * @param {number} [duration=3000] - The duration in milliseconds before the message is hidden.
 */
export function showMessage(message, type = 'info', duration = 3000) {
  const messageContainer = document.getElementById('messageContainer');
  if (!messageContainer) {
    console.error('Message container not found.');
    return;
  }
  messageContainer.textContent = message;
  // Start with base class, add type-specific class, and ensure hidden is managed
  messageContainer.className = 'message'; // Reset classes
  messageContainer.classList.add(type); // Add specific type like 'error' or 'info'
  messageContainer.classList.remove('hidden'); // Show the message
  
  // If there's an existing timeout, clear it to prevent premature hiding
  if (messageContainer.timeoutId) {
    clearTimeout(messageContainer.timeoutId);
  }

  messageContainer.timeoutId = setTimeout(() => {
    messageContainer.classList.add('hidden'); // Hide after duration
    messageContainer.timeoutId = null; // Clear the stored timeout ID
  }, duration);
}

export function showLoading(element) {
  element.classList.remove("hidden");
  element.classList.add("visible");
}

export function hideLoading(element) {
  element.classList.remove("visible");
  element.classList.add("hidden");
}

export function showError(message) {
  showMessage(message, 'error'); // Default duration will be used
}