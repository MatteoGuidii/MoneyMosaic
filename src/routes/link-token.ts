import { Router } from 'express';
import { plaidClient } from '../plaidClient';
import { Products, CountryCode } from 'plaid';
import { config } from '../config';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/link/token/create:
 *   post:
 *     summary: Create Plaid Link token
 *     description: Creates a link token for initializing Plaid Link to connect bank accounts
 *     tags: [Authentication]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: Optional user ID for the link token
 *     responses:
 *       200:
 *         description: Link token created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LinkToken'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * Create a Link Token for initializing Plaid Link
 * @route POST /api/link/token/create
 * @access Public
 * @description Creates a link token for Plaid Link initialization
 * 
 * ⚠️  CRITICAL PLAID ENDPOINT - DO NOT REMOVE
 * This endpoint is required by Plaid's official API specification.
 * Corresponds to Plaid's /link/token/create endpoint.
 * Removing this will break the entire Plaid integration.
 */
router.post('/link/token/create', async (req, res) => {
  try {
    // Generate a unique user ID (you might want to get this from session/auth)
    const clientUserId = req.body.user_id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const linkTokenRequest = {
      client_name: config.plaid.clientName,
      user: { 
        client_user_id: clientUserId 
      },
      products: [Products.Transactions],
      country_codes: [CountryCode.Ca], 
      language: 'en'
    };

    // Add optional fields only if they're configured
    if (config.plaid.webhookUrl) {
      (linkTokenRequest as any).webhook = config.plaid.webhookUrl;
    }
    
    if (config.plaid.redirectUri) {
      (linkTokenRequest as any).redirect_uri = config.plaid.redirectUri;
    }

    logger.debug('Creating link token with config:', {
      client_name: linkTokenRequest.client_name,
      user_id: clientUserId,
      environment: config.plaid.environment,
      webhook: config.plaid.webhookUrl,
      redirect_uri: config.plaid.redirectUri
    });

    const response = await plaidClient.linkTokenCreate(linkTokenRequest);
    
    res.json({ 
      link_token: response.data.link_token,
      expiration: response.data.expiration 
    });
  } catch (err: any) {
    console.error('createLinkToken error:', {
      error: err.message,
      status: err.response?.status,
      data: err.response?.data,
      config: {
        environment: config.plaid.environment,
        clientId: config.plaid.clientId ? '[SET]' : '[MISSING]',
        secret: config.plaid.secret ? '[SET]' : '[MISSING]'
      }
    });
    
    // Provide more specific error information
    if (err.response?.data?.error_code === 'DIRECT_INTEGRATION_NOT_ENABLED') {
      res.status(400).json({ 
        error: 'Direct integration not enabled',
        message: 'You must use Plaid Link to create Items in Development/Production environment',
        solution: 'Ensure you are using the proper Link flow instead of direct API calls',
        environment: config.plaid.environment,
        details: err.response.data
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to create link token',
        details: err.response?.data?.error_message || err.message
      });
    }
  }
});

/**
 * Check Plaid configuration and connection
 * @route GET /api/link/config/check
 * @access Public (in development only)
 * @description Verify Plaid configuration without exposing sensitive data
 */
router.get('/config/check', async (_req, res) => {
  try {
    const configCheck = {
      environment: config.plaid.environment,
      clientName: config.plaid.clientName,
      hasClientId: !!config.plaid.clientId,
      hasSecret: !!config.plaid.secret,
      webhookUrl: config.plaid.webhookUrl || 'Not configured',
      redirectUri: config.plaid.redirectUri || 'Not configured'
    };

    // Only show this in development
    if (config.server.environment !== 'production') {
      res.json({
        status: 'Configuration check',
        config: configCheck,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(403).json({ error: 'Config check not available in production' });
    }
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Configuration check failed',
      message: error.message
    });
  }
});

/**
 * Diagnostic endpoint for troubleshooting Plaid issues
 * @route POST /api/link/diagnose
 * @access Public (in development only)
 * @description Test Plaid connection and diagnose issues
 */
router.post('/link/diagnose', async (_req, res) => {
  if (config.server.environment === 'production') {
    res.status(403).json({ error: 'Diagnostic endpoint not available in production' });
    return;
  }

  try {
    // Test basic link token creation with minimal config
    const testUserId = `diagnose_${Date.now()}`;
    
    const linkTokenRequest = {
      client_name: config.plaid.clientName,
      user: { 
        client_user_id: testUserId 
      },
      products: [Products.Transactions],
      country_codes: [CountryCode.Ca], 
      language: 'en'
    };

    logger.info('Running Plaid diagnostic test...', {
      environment: config.plaid.environment,
      request: linkTokenRequest
    });

    const response = await plaidClient.linkTokenCreate(linkTokenRequest);
    
    res.json({
      status: 'success',
      message: 'Plaid connection is working correctly',
      environment: config.plaid.environment,
      linkTokenCreated: !!response.data.link_token,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Plaid diagnostic failed:', error);
    
    res.status(400).json({
      status: 'error',
      error: error.message,
      errorCode: error.response?.data?.error_code,
      errorType: error.response?.data?.error_type,
      displayMessage: error.response?.data?.display_message,
      environment: config.plaid.environment,
      troubleshooting: {
        'DIRECT_INTEGRATION_NOT_ENABLED': 'Your account may not have access to Development environment or you need to request access',
        'INVALID_CLIENT_ID': 'Check your PLAID_CLIENT_ID',
        'INVALID_SECRET': 'Check your PLAID_SECRET',
        'INVALID_ENVIRONMENT': 'Verify your PLAID_ENV setting'
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get available institutions for testing
 * @route GET /api/link/institutions
 * @access Public (in development only)
 * @description Get list of supported institutions
 */
router.get('/institutions', async (_req, res) => {
  if (config.server.environment === 'production') {
    res.status(403).json({ error: 'Institution list not available in production' });
    return;
  }

  try {
    const response = await plaidClient.institutionsGet({
      count: 50,
      offset: 0,
      country_codes: [CountryCode.Ca, CountryCode.Us],
      options: {
        include_optional_metadata: true
      }
    });
    
    const institutions = response.data.institutions.map(inst => ({
      institution_id: inst.institution_id,
      name: inst.name,
      country_codes: inst.country_codes,
      products: inst.products,
      oauth: inst.oauth
    }));

    res.json({
      status: 'success',
      total: institutions.length,
      institutions: institutions
    });
  } catch (error: any) {
    logger.error('Failed to fetch institutions:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      message: 'Failed to fetch supported institutions'
    });
  }
});

export default router;