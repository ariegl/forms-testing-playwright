import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LinkifiedText from './LinkifiedText';
import { expect, vi, describe, it, beforeEach } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'social.linkModal.title': 'Confirm Navigation',
        'social.linkModal.description': 'Description',
        'social.linkModal.warning': 'Warning',
        'social.linkModal.confirm': 'Ir al sitio',
        'common.cancel': 'Cancelar'
      };
      return translations[key] || key;
    }
  })
}));

describe('LinkifiedText', () => {
  beforeEach(() => {
    vi.stubGlobal('open', vi.fn());
    // Mock HTMLDialogElement for DaisyUI modal
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  it('renders normal text', () => {
    render(<LinkifiedText text="Hello world" />);
    expect(screen.getByText('Hello world')).toBeDefined();
  });

  it('renders a link when URL is present', () => {
    render(<LinkifiedText text="Visit https://google.com today" />);
    const link = screen.getByRole('link', { name: /https:\/\/google\.com/ });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('https://google.com');
  });

  it('shows modal on click', () => {
    render(<LinkifiedText text="https://google.com" />);
    const link = screen.getByRole('link');
    
    fireEvent.click(link);
    
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('opens new window when confirming in modal', () => {
    render(<LinkifiedText text="https://google.com" />);
    const link = screen.getByRole('link');
    
    fireEvent.click(link);
    
    const confirmButton = screen.getByText('Ir al sitio');
    fireEvent.click(confirmButton);
    
    expect(window.open).toHaveBeenCalledWith('https://google.com', '_blank', 'noopener,noreferrer');
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it('closes modal without opening window on cancel', () => {
    render(<LinkifiedText text="https://google.com" />);
    const link = screen.getByRole('link');
    
    fireEvent.click(link);
    
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    
    expect(window.open).not.toHaveBeenCalled();
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it('applies correct class for primary background', () => {
    render(<LinkifiedText text="https://google.com" isPrimary={true} />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('text-white');
  });

  it('applies correct class for secondary background', () => {
    render(<LinkifiedText text="https://google.com" isPrimary={false} />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('text-primary-content');
  });
});
