import { Html5Qrcode } from 'html5-qrcode';

/**
 * Service for handling barcode/QR code scanning
 */
export class ScannerService {
	private html5QrCode: Html5Qrcode | null = null;
	private isScanning: boolean = false;

	/**
	 * Initialize the scanner
	 */
	async startScanner(
		elementId: string,
		onSuccess: (decodedText: string) => void,
		onError?: (error: string) => void
	): Promise<void> {
		if (this.isScanning) {
			throw new Error('Scanner is already running');
		}

		try {
			this.html5QrCode = new Html5Qrcode(elementId);

			const config = {
				fps: 10,
				qrbox: { width: 250, height: 250 },
				aspectRatio: 1.0
			};

			// Try to use back camera (environment) for mobile devices
			await this.html5QrCode.start(
				{ facingMode: "environment" },
				config,
				(decodedText, decodedResult) => {
					// Filter for ISBN/EAN-13 only (13 digits)
					if (this.isValidISBN(decodedText)) {
						onSuccess(decodedText);
					}
				},
				(errorMessage) => {
					// Ignore scanning errors (happens constantly while scanning)
					// Only log if callback is provided
					if (onError && !errorMessage.includes('NotFoundException')) {
						console.warn('Scan error:', errorMessage);
					}
				}
			);

			this.isScanning = true;
		} catch (error) {
			console.error('Error starting scanner:', error);
			throw new Error('Failed to start camera. Please grant camera permissions.');
		}
	}

	/**
	 * Stop the scanner
	 */
	async stopScanner(): Promise<void> {
		if (!this.html5QrCode || !this.isScanning) {
			return;
		}

		try {
			await this.html5QrCode.stop();
			this.html5QrCode.clear();
			this.isScanning = false;
		} catch (error) {
			console.error('Error stopping scanner:', error);
		}
	}

	/**
	 * Check if scanner is currently running
	 */
	isRunning(): boolean {
		return this.isScanning;
	}

	/**
	 * Validate if the scanned code is a valid ISBN/EAN-13
	 */
	private isValidISBN(code: string): boolean {
		// Remove any hyphens or spaces
		const cleanCode = code.replace(/[-\s]/g, '');

		// Check if it's 13 digits (EAN-13/ISBN-13) or 10 digits (ISBN-10)
		return /^\d{13}$/.test(cleanCode) || /^\d{9}[0-9X]$/i.test(cleanCode);
	}
}
