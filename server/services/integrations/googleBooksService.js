/**
 * AdaptIQ 3.0 — Google Books Educational Reference Service
 * server/services/integrations/googleBooksService.js
 * 
 * Queries Google Books API v1 for NCERT textbooks, reference solutions, and academic texts.
 */

class GoogleBooksService {
  constructor() {
    this.apiKey = process.env.GOOGLE_BOOKS_API_KEY || null;
    this.isConfigured = Boolean(this.apiKey);
  }

  getStatus() {
    return {
      service: 'Google Books API',
      configured: this.isConfigured,
      mode: this.isConfigured ? 'LIVE_API' : 'CURATED_NCERT_LIBRARY'
    };
  }

  /**
   * Search for books by query and grade/subject
   * @param {Object} params
   * @param {string} params.query
   * @param {string} [params.grade]
   * @param {string} [params.subject]
   * @param {number} [params.maxResults=5]
   * @returns {Promise<Array<Object>>}
   */
  async searchBooks({ query, grade = '10', subject = 'Mathematics', maxResults = 5 }) {
    const searchQuery = `${query || subject} Class ${grade} NCERT CBSE`.trim();

    if (this.isConfigured) {
      try {
        const url = new URL('https://www.googleapis.com/books/v1/volumes');
        url.searchParams.set('q', searchQuery);
        url.searchParams.set('maxResults', String(maxResults));
        url.searchParams.set('printType', 'books');
        url.searchParams.set('key', this.apiKey);

        const response = await fetch(url.toString());
        if (response.ok) {
          const data = await response.json();
          return (data.items || []).map(item => {
            const vol = item.volumeInfo || {};
            return {
              id: item.id,
              title: vol.title,
              authors: vol.authors || ['NCERT Author Panel'],
              publisher: vol.publisher || 'National Council of Educational Research and Training',
              publishedDate: vol.publishedDate || '2024',
              description: vol.description || 'Standard CBSE Curriculum Textbook',
              pageCount: vol.pageCount,
              categories: vol.categories || [subject],
              thumbnailUrl: vol.imageLinks?.thumbnail || vol.imageLinks?.smallThumbnail || null,
              infoLink: vol.infoLink || 'https://ncert.nic.in/textbook.php'
            };
          });
        }
      } catch (err) {
        console.warn('[GoogleBooksService] Live search failed, using fallback:', err.message);
      }
    }

    // Standard Curated CBSE Textbook & Reference Books
    return [
      {
        id: `gps_book_ncert_${grade}_${subject.toLowerCase()}`,
        title: `NCERT Class ${grade} ${subject} — Official Textbook`,
        authors: ['NCERT Curriculum Panel'],
        publisher: 'NCERT New Delhi',
        publishedDate: '2025-2026',
        description: `Official prescribed textbook for Class ${grade} ${subject} under the CBSE curriculum framework.`,
        pageCount: 248,
        categories: [subject, 'CBSE Textbooks'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60',
        infoLink: 'https://ncert.nic.in/textbook.php'
      },
      {
        id: `gps_book_exemplar_${grade}_${subject.toLowerCase()}`,
        title: `NCERT Exemplar Problems — Class ${grade} ${subject}`,
        authors: ['Department of Education in Science and Mathematics'],
        publisher: 'NCERT New Delhi',
        publishedDate: '2025',
        description: 'Higher-order thinking skill (HOTS) questions, multiple-choice drills, and comprehensive solutions.',
        pageCount: 196,
        categories: [subject, 'Exemplar'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=60',
        infoLink: 'https://ncert.nic.in/exemplar-problems.php'
      }
    ];
  }
}

module.exports = new GoogleBooksService();
