import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImageCropper from './ImageCropper';
import React from 'react';

// Mock react-easy-crop to avoid canvas issues in tests
vi.mock('react-easy-crop', () => ({
  default: ({ onCropChange, onZoomChange }) => (
    <div data-testid="mock-cropper">
      <button onClick={() => onCropChange({ x: 0, y: 0 })}>Change Crop</button>
      <button onClick={() => onZoomChange(2)}>Change Zoom</button>
    </div>
  ),
}));

// Mock imageUtils
vi.mock('../../utils/imageUtils', () => ({
  getCroppedImg: vi.fn(() => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' }))),
}));

describe('ImageCropper Component', () => {
  const mockOnCropComplete = vi.fn();
  const mockOnCancel = vi.fn();
  const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  it('renders correctly', () => {
    render(
      <ImageCropper 
        image={testImage} 
        onCropComplete={mockOnCropComplete} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByTestId('mock-cropper')).toBeInTheDocument();
    expect(screen.getByText('Zoom:')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Recortar y Guardar')).toBeInTheDocument();
  });

  it('calls onCancel when Cancelar button is clicked', () => {
    render(
      <ImageCropper 
        image={testImage} 
        onCropComplete={mockOnCropComplete} 
        onCancel={mockOnCancel} 
      />
    );

    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onCropComplete when Recortar y Guardar button is clicked', async () => {
    render(
      <ImageCropper 
        image={testImage} 
        onCropComplete={mockOnCropComplete} 
        onCancel={mockOnCancel} 
      />
    );

    fireEvent.click(screen.getByText('Recortar y Guardar'));
    
    // Since getCroppedImg is async, we might need to wait if not mocked synchronously
    // In our mock it's a resolved promise
    await vi.waitFor(() => {
        expect(mockOnCropComplete).toHaveBeenCalled();
    });
  });
});
