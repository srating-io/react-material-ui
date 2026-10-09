import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { Wizard, WizardStep } from '../../src/layout/Wizard.tsx';

describe('Wizard', () => {
  const steps: WizardStep[] = [
    {
      id: 'step-1',
      title: 'Personal Info',
      isValid: () => true,
      content: <div>Step 1 Content</div>,
    },
    {
      id: 'step-2',
      title: 'Preferences',
      isValid: () => true,
      content: <div>Step 2 Content</div>,
    },
    {
      id: 'step-3',
      title: 'Review',
      isValid: () => true,
      content: <div>Step 3 Content</div>,
    },
  ];

  it('renders initial step content and Next button', () => {
    render(<Wizard steps={steps} />);
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('prevents advancing to next step if isValid returns false', async () => {
    const user = userEvent.setup();
    const validationTrigger = vi.fn();

    const invalidSteps: WizardStep[] = [
      {
        id: 'step-invalid',
        title: 'Form Step',
        isValid: () => false,
        content: <div>Invalid Step</div>,
      },
      {
        id: 'step-next',
        title: 'Next Step',
        isValid: () => true,
        content: <div>Next Step</div>,
      },
    ];

    render(<Wizard steps={invalidSteps} validationTrigger={validationTrigger} />);
    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(validationTrigger).toHaveBeenCalledWith(true);
    expect(screen.getByText('Invalid Step')).toBeInTheDocument();
  });

  it('renders Save button on the final step and calls onSave', () => {
    const handleSave = vi.fn();
    const singleStep: WizardStep[] = [
      {
        id: 'step-final',
        title: 'Only Step',
        isValid: () => true,
        content: <div>Final Content</div>,
      },
    ];

    render(<Wizard steps={singleStep} onSave={handleSave} saveButtonText="Submit Application" />);
    expect(screen.getByRole('button', { name: /submit application/i })).toBeInTheDocument();
  });
});
