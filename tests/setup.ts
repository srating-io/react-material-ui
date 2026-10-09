import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

beforeEach(() => {
  let menuRoot = document.getElementById('menu-root');
  if (!menuRoot) {
    menuRoot = document.createElement('div');
    menuRoot.setAttribute('id', 'menu-root');
    document.body.appendChild(menuRoot);
  }
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});
