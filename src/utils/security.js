export const initSecurity = () => {
  // Basic DevTools prevention
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // Keyboard shortcuts prevention
  document.addEventListener('keydown', (e) => {
    if (
      e.keyCode === 123 || // F12
      (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I or J
      (e.ctrlKey && e.keyCode === 85) // Ctrl+U
    ) {
      e.preventDefault();
    }
  });
};