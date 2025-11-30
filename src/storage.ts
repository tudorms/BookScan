import { Collection, Book } from './types.js';

/**
 * Service for managing data persistence using localStorage
 */
export class StorageService {
	private static readonly COLLECTIONS_KEY = 'bookScan_collections';

	/**
	 * Load all collections from localStorage
	 */
	static loadCollections(): Collection[] {
		try {
			const data = localStorage.getItem(this.COLLECTIONS_KEY);
			return data ? JSON.parse(data) : [];
		} catch (error) {
			console.error('Error loading collections:', error);
			return [];
		}
	}

	/**
	 * Save all collections to localStorage
	 */
	static saveCollections(collections: Collection[]): void {
		try {
			localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify(collections));
		} catch (error) {
			console.error('Error saving collections:', error);
			throw new Error('Failed to save collections. Storage may be full.');
		}
	}

	/**
	 * Create a new collection
	 */
	static createCollection(name: string): Collection {
		const collections = this.loadCollections();

		const newCollection: Collection = {
			id: this.generateId(),
			name: name.trim(),
			books: [],
			createdDate: new Date().toISOString(),
			modifiedDate: new Date().toISOString()
		};

		collections.push(newCollection);
		this.saveCollections(collections);

		return newCollection;
	}

	/**
	 * Update a collection
	 */
	static updateCollection(collectionId: string, updates: Partial<Collection>): void {
		const collections = this.loadCollections();
		const index = collections.findIndex(c => c.id === collectionId);

		if (index === -1) {
			throw new Error('Collection not found');
		}

		collections[index] = {
			...collections[index],
			...updates,
			modifiedDate: new Date().toISOString()
		};

		this.saveCollections(collections);
	}

	/**
	 * Delete a collection
	 */
	static deleteCollection(collectionId: string): void {
		const collections = this.loadCollections();
		const filtered = collections.filter(c => c.id !== collectionId);
		this.saveCollections(filtered);
	}

	/**
	 * Get a single collection by ID
	 */
	static getCollection(collectionId: string): Collection | null {
		const collections = this.loadCollections();
		return collections.find(c => c.id === collectionId) || null;
	}

	/**
	 * Add a book to a collection
	 */
	static addBookToCollection(collectionId: string, book: Omit<Book, 'id' | 'addedDate'>): Book {
		const collections = this.loadCollections();
		const collection = collections.find(c => c.id === collectionId);

		if (!collection) {
			throw new Error('Collection not found');
		}

		const newBook: Book = {
			...book,
			id: this.generateId(),
			addedDate: new Date().toISOString()
		};

		collection.books.push(newBook);
		collection.modifiedDate = new Date().toISOString();

		this.saveCollections(collections);

		return newBook;
	}

	/**
	 * Remove a book from a collection
	 */
	static removeBookFromCollection(collectionId: string, bookId: string): void {
		const collections = this.loadCollections();
		const collection = collections.find(c => c.id === collectionId);

		if (!collection) {
			throw new Error('Collection not found');
		}

		collection.books = collection.books.filter(b => b.id !== bookId);
		collection.modifiedDate = new Date().toISOString();

		this.saveCollections(collections);
	}

	/**
	 * Generate a unique ID
	 */
	private static generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}
}
