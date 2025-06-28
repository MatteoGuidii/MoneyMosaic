import { Router } from 'express';
import { plaidClient } from '../plaidClient';
import { subDays, formatISO } from 'date-fns';

const router = Router();

interface FetchBody {
  access_token: string;
  days?: number;
}

router.post('/fetch_transactions', async (req, res) => {
  try {
    const { access_token, days = 30 } = req.body as FetchBody;

    // 1) Define date range
    const endDate   = formatISO(new Date(), { representation: 'date' });
    const startDate = formatISO(subDays(new Date(), days), { representation: 'date' });

    // 2) Fetch transactions from Plaid
    const { data: { transactions: txns } } = await plaidClient.transactionsGet({
      access_token,
      start_date:  startDate,
      end_date:    endDate,
      options:     { count: 500, offset: 0 },
    });

    // 3) Map & categorize each transaction
    const categorized = txns.map(tx => {
      // a) Determine type
      const type = tx.amount > 0 ? 'spending' : 'income';

      // b) Extract top-level category from personal_finance_category
      let category: string;
      const pfc = tx.personal_finance_category;
      if (Array.isArray(pfc) && pfc.length > 0) {
        // e.g. ["Food and Drink", "Restaurants"]
        category = pfc[0];
      } else if (typeof pfc === 'string') {
        category = pfc;
      } else {
        category = 'Uncategorized';
      }

      return {
        date:      tx.date,
        name:      tx.name,
        amount:    tx.amount,
        type,
        category,
      };
    });

    // 4) Build summary totals
    const summary = categorized.reduce<{
      totals: Record<'spending' | 'income', number>;
      byCategory: Record<string, number>;
    }>(
      (acc, tx) => {
        acc.totals[tx.type as 'spending' | 'income'] = (acc.totals[tx.type as 'spending' | 'income'] || 0) + Math.abs(tx.amount);
        acc.byCategory[tx.category] = (acc.byCategory[tx.category] || 0) + Math.abs(tx.amount);
        return acc;
      },
      { totals: { spending: 0, income: 0 }, byCategory: {} }
    );

    // 5) Respond
    res.json({ transactions: categorized, summary });
  } catch (err) {
    console.error('fetchTransactions error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
