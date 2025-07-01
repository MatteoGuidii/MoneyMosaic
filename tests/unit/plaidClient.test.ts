import { plaidClient } from '../../src/plaidClient';
import { Products, CountryCode } from 'plaid';

// Mock plaidClient
jest.mock('../../src/plaidClient', () => ({
  plaidClient: {
    linkTokenCreate: jest.fn(),
  },
}));

describe('PlaidClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('linkTokenCreate', () => {
    it('should be properly mocked', () => {
      expect(plaidClient.linkTokenCreate).toBeDefined();
      expect(typeof plaidClient.linkTokenCreate).toBe('function');
    });

    it('should return mocked response when called', async () => {
      const mockResponse = {
        data: {
          link_token: 'test_link_token',
          expiration: '2024-01-01T00:00:00Z',
        },
      };

      (plaidClient.linkTokenCreate as jest.Mock).mockResolvedValue(mockResponse);

      const result = await plaidClient.linkTokenCreate({
        client_name: 'Test App',
        user: { client_user_id: 'test_user' },
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
      });

      expect(result).toEqual(mockResponse);
      expect(plaidClient.linkTokenCreate).toHaveBeenCalledWith({
        client_name: 'Test App',
        user: { client_user_id: 'test_user' },
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
      });
    });

    it('should handle errors when mocked to reject', async () => {
      const mockError = new Error('Plaid API Error');
      (plaidClient.linkTokenCreate as jest.Mock).mockRejectedValue(mockError);

      await expect(
        plaidClient.linkTokenCreate({
          client_name: 'Test App',
          user: { client_user_id: 'test_user' },
          products: [Products.Transactions],
          country_codes: [CountryCode.Us],
          language: 'en',
        })
      ).rejects.toThrow('Plaid API Error');
    });
  });
});
