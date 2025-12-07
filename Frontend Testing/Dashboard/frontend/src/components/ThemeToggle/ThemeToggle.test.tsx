import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './ThemeToggle';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.setAttribute('data-theme', '');
});

describe('ThemeToggle', () => {
  it('mostra o ícone inicial e alterna o tema', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /alternar tema/i });

    expect(button).toHaveTextContent('🌙');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    await user.click(button);

    expect(button).toHaveTextContent('☀️');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('respeita o tema guardado no localStorage', () => {
    localStorage.setItem('theme', 'light');
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /alternar tema/i });
    expect(button).toHaveTextContent('☀️');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

