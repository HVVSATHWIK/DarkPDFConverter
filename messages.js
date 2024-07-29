export function showLoading(element) {
  element.classList.remove("hidden");
  element.classList.add("visible");
}

export function hideLoading(element) {
  element.classList.remove("visible");
  element.classList.add("hidden");
}

export function showError(message) {
  showMessage(message, 'error');
}

export function showMessage(message, type = 'info') {
  const messageContainer = document.createElement('div');
  messageContainer.className = `message ${type}`;
  messageContainer.textContent = message;
  document.body.appendChild(messageContainer);

  setTimeout(() => {
      messageContainer.classList.add('fade-out');
      setTimeout(() => {
          document.body.removeChild(messageContainer);
      }, 1000);
  }, 3000);
}
