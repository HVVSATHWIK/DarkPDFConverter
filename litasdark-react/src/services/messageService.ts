import type { Message } from '../hooks/usePdfSettings';

// Initialize with safe defaults
let setLoadingState: (l: boolean) => void = () => {};
let addMessage: (msg: Message) => void = () => {};
let removeMessage: (id: string) => void = () => {};

export const registerMessageHandlers = (
  setLoading: (l: boolean) => void,
  pushMessage: (msg: Message) => void,
  removeMsg: (id: string) => void
) => {
  setLoadingState = setLoading;
  addMessage = pushMessage;
  removeMessage = removeMsg;
};

export const showLoading = () => setLoadingState(true);
export const hideLoading = () => setLoadingState(false);
export const showMessage = (text: string) => {
  const id = Date.now().toString();
  addMessage({ id, type: 'info', text });
  setTimeout(() => removeMessage(id), 5000);
};
export const showError = (text: string) => {
  const id = Date.now().toString();
  addMessage({ id, type: 'error', text });
  setTimeout(() => removeMessage(id), 7000);
};