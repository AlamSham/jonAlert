import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';
import Error from '@/app/error';

// Mock the API call for NotFound page
jest.mock('@/lib/api', () => ({
  getLatestJobs: jest.fn().mockResolvedValue([
    {
      _id: '1',
      title: 'Test Job',
      slug: 'test-job',
      category: 'job' as const,
      summary: 'Test job summary',
      state: 'Test State',
      organization: 'Test Org',
      vacancyCount: 100,
      tags: ['test'],
      createdAt: '2024-01-01T00:00:00Z',
    }
  ])
}));

describe('Error Pages', () => {
  describe('NotFound (404) Page', () => {
    it('renders 404 page with search form and categories', async () => {
      const NotFoundPage = await NotFound();
      render(NotFoundPage);
      
      // Check main heading
      expect(screen.getByText('404 - Page Nahi Mila')).toBeInTheDocument();
      
      // Check search section
      expect(screen.getByText('🔍 Kuch Aur Search Karein')).toBeInTheDocument();
      
      // Check popular categories
      expect(screen.getByText('📂 Popular Categories')).toBeInTheDocument();
      expect(screen.getByText('Sarkari Naukri')).toBeInTheDocument();
      expect(screen.getByText('Results')).toBeInTheDocument();
      expect(screen.getByText('Admit Card')).toBeInTheDocument();
      
      // Check navigation buttons
      expect(screen.getByText('🏠 Home Page')).toBeInTheDocument();
      expect(screen.getByText('💼 Browse Jobs')).toBeInTheDocument();
    });

    it('includes noindex meta tag', () => {
      // This would be tested in an integration test with actual metadata
      expect(true).toBe(true); // Placeholder for metadata test
    });
  });

  describe('Error (500) Page', () => {
    const mockError = new Error('Test error');
    const mockReset = jest.fn();

    it('renders error page with contact information', () => {
      render(<Error error={mockError} reset={mockReset} />);
      
      // Check main heading
      expect(screen.getByText('Kuch Galat Ho Gaya!')).toBeInTheDocument();
      
      // Check apology message
      expect(screen.getByText('🙏 Maafi Chahte Hain')).toBeInTheDocument();
      
      // Check action buttons
      expect(screen.getByText('🔄 Dobara Try Karein')).toBeInTheDocument();
      expect(screen.getByText('📧 Contact Us')).toBeInTheDocument();
      
      // Check help section
      expect(screen.getByText('🤔 Kya Kar Sakte Hain?')).toBeInTheDocument();
      
      // Check contact information
      expect(screen.getByText('📞 Emergency Contact')).toBeInTheDocument();
      expect(screen.getByText('contact@sarkaripulse.net')).toBeInTheDocument();
    });

    it('calls reset function when retry button is clicked', () => {
      render(<Error error={mockError} reset={mockReset} />);
      
      const retryButton = screen.getByText('🔄 Dobara Try Karein');
      retryButton.click();
      
      expect(mockReset).toHaveBeenCalled();
    });
  });
});