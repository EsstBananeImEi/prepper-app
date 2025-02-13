import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('Loading Spinner test', () => {
    it('spinner is visible', () => {
        render(<LoadingSpinner message={''} />);
        const spinnerElement = document.getElementsByClassName('ui active inverted dimmer');
        expect(spinnerElement).toBeTruthy();
    });

    it('message is correct', () => {
        render(<LoadingSpinner message={'Lade BookShelf ...'} />);
        const spinnerElement = screen.getByText(/Lade BookShelf .../i);
        expect(spinnerElement).toBeInTheDocument();
    });

})
