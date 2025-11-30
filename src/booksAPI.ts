import { GoogleBooksResponse, Book } from './types.js';

/**
 * Service for fetching book information from Google Books API
 */
export class BooksAPIService {
	private static readonly BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

	/**
	 * Fetch book details by ISBN
	 */
	static async fetchBookByISBN(isbn: string): Promise<Book | null> {
		try {
			const cleanISBN = isbn.replace(/[^0-9X]/gi, '');
			const response = await fetch(`${this.BASE_URL}?q=isbn:${cleanISBN}`);

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const data: GoogleBooksResponse = await response.json();

			if (!data.items || data.items.length === 0) {
				return null;
			}

			return this.convertGoogleBookToBook(data.items[0], cleanISBN);
		} catch (error) {
			console.error('Error fetching book from Google Books API:', error);
			throw new Error('Failed to fetch book details. Please check your connection.');
		}
	}

	/**
	 * Search for books by query (title, author, etc.)
	 */
	static async searchBooks(query: string): Promise<Book[]> {
		try {
			const encodedQuery = encodeURIComponent(query);
			const response = await fetch(`${this.BASE_URL}?q=${encodedQuery}&maxResults=10`);

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const data: GoogleBooksResponse = await response.json();

			if (!data.items || data.items.length === 0) {
				return [];
			}

			return data.items.map(item => this.convertGoogleBookToBook(item));
		} catch (error) {
			console.error('Error searching books:', error);
			throw new Error('Failed to search books. Please check your connection.');
		}
	}

	/**
	 * Convert Google Books API response to our Book interface
	 */
	private static convertGoogleBookToBook(item: any, isbn?: string): Book {
		const volumeInfo = item.volumeInfo || {};

		// Extract ISBN if not provided
		let bookISBN = isbn;
		if (!bookISBN && volumeInfo.industryIdentifiers) {
			const isbn13 = volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_13');
			const isbn10 = volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_10');
			bookISBN = isbn13?.identifier || isbn10?.identifier;
		}

		return {
			id: '', // Will be set by StorageService
			isbn: bookISBN,
			title: volumeInfo.title || 'Unknown Title',
			authors: volumeInfo.authors || [],
			publisher: volumeInfo.publisher,
			publishedDate: volumeInfo.publishedDate,
			description: volumeInfo.description,
			thumbnail: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
			addedDate: '' // Will be set by StorageService
		};
	}
}
