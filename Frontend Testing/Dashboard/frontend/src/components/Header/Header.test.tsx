import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renderiza marca e botão de tema com acessibilidade', () => {
    render(<Header />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText(/dashboard transportes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alternar tema/i })).toBeInTheDocument();
  });
});

