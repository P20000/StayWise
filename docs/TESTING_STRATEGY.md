# StayWise.ai — Quality Assurance & Testing Strategy
To maintain high architectural reliability, protect revenue against financial miscalculations, and guarantee zero double-booking race conditions across the platform, [StayWise.ai](http://StayWise.ai) enforces a **rigorous automated testing strategy** spanning backend concurrency stress tests (`Jest + Supertest`) and frontend component interaction testing (`React Testing Library`).
---
## 1. Backend API & Concurrency Testing (`Jest + Supertest`)
Our backend test suite verifies authentication boundaries, stateless file validation, and pessimistic distributed locking under high load.
### A. Mocking Stripe & Razorpay Cryptographic Webhook Payloads
Because our webhook handlers use `express.raw()` and verify HMAC signatures using `STRIPE_WEBHOOK_SECRET` (`Rule #10`), integration tests must generate valid cryptographic headers or mock the verification method during test runner initialization:
```javascript
import request from 'supertest';
import stripe from 'stripe';
import app from '../app.js';

describe('POST /api/payment/webhook/stripe - Cryptographic Supremacy', () => {
  it('should reject unauthenticated or tampered webhook payloads with 400 Bad Request', async () => {
    const fakePayload = JSON.stringify({ id: 'evt_tampered', type: 'payment_intent.succeeded' });
    
    const response = await request(app)
      .post('/api/payment/webhook/stripe')
      .set('stripe-signature', 't=12345,v1=invalid_hmac_hash')
      .set('Content-Type', 'application/json')
      .send(fakePayload);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Webhook signature verification failed');
  });

  it('should process verified webhook exactly once and ignore replays (Idempotency Check)', async () => {
    // Spy and mock stripe.webhooks.constructEvent to simulate exact signature verification
    const mockEvent = {
      id: 'evt_test_idempotent_8899',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_123', metadata: { roomId: '6612a8...', checkIn: '2026-04-12' } } }
    };
    jest.spyOn(stripe.webhooks, 'constructEvent').mockReturnValue(mockEvent);

    // First Delivery: Should commit booking slot and return 200
    const firstRes = await request(app)
      .post('/api/payment/webhook/stripe')
      .set('stripe-signature', 'valid_sig')
      .send(JSON.stringify(mockEvent));
    expect(firstRes.status).toBe(200);
    expect(firstRes.body.received).toBe(true);

    // Second Delivery (Simulated Replay Attack): Should return 200 with IDEMPOTENT_REPLAY_IGNORED
    const replayRes = await request(app)
      .post('/api/payment/webhook/stripe')
      .set('stripe-signature', 'valid_sig')
      .send(JSON.stringify(mockEvent));
    expect(replayRes.status).toBe(200);
    expect(replayRes.body.status).toBe('IDEMPOTENT_REPLAY_IGNORED');
  });
});
```
---
### B. High-Concurrency Stress Testing (`PCC` Redis Lock Verification)
To mathematically prove that our **Redis Pessimistic Concurrency Control (****`Rule #11`****)** prevents double-booking when multiple users attempt to reserve the final available room slot simultaneously, we execute concurrent promise floods using `Promise.allSettled`:
```javascript
describe('High-Concurrency Double-Booking Prevention Stress Test', () => {
  it('should allow exactly 1 successful checkout lock across 50 concurrent requests for the exact same dates', async () => {
    const targetRoomId = '6612a8f9c1b3e8203f1a9d01';
    const checkIn = '2026-12-20';
    const checkOut = '2026-12-25';

    // Generate 50 simultaneous checkout requests from 50 distinct test users
    const concurrentRequests = Array.from({ length: 50 }, (_, i) => {
      return request(app)
        .post('/api/payment/intent')
        .set('Authorization', `Bearer ${generateTestToken(`user_${i}`)}`)
        .send({ roomId: targetRoomId, checkIn, checkOut, guests: 2, gateway: 'STRIPE' });
    });

    const results = await Promise.allSettled(concurrentRequests);

    // Categorize responses
    const successfulLocks = results.filter(r => r.status === 'fulfilled' && r.value.status === 200);
    const conflictErrors = results.filter(r => r.status === 'fulfilled' && r.value.status === 409);

    // ASSERTION SUPREMACY: Exactly 1 request must acquire the Redis lock. All other 49 MUST fail with 409 Conflict.
    expect(successfulLocks.length).toBe(1);
    expect(conflictErrors.length).toBe(49);
    expect(conflictErrors[0].value.body.error).toContain('currently locked by another guest checkout');
  });
});
```
---
## 2. Frontend Presentation Layer Testing (`React Testing Library`)
Frontend tests verify strict adherence to the **Elevated Brutalism UI specification**, state compartmentalization, and precise itemized concession ledger arithmetic.
### A. Compartmentalized `SearchBar` State Verification
Verifies that individual compartment inputs update Redux state correctly without pill-shape CSS violations:
---
### B. `CostBreakdown` Concession Ledger Arithmetic Test
Verifies that the itemized pricing table calculates StayWise platform cuts (`7%`), GST (`18%`), and total payable math with 100% precision:
---
## 3. Mandatory Code Coverage Thresholds
To enforce engineering rigor across the repository, the automated Continuous Integration (`CI`) pipeline enforces strict coverage floors via Jest configurations:
<table>
<tr>
<td>Component / Layer</td>
<td>Minimum Line Coverage</td>
<td>Minimum Branch Coverage</td>
<td>Rationale</td>
</tr>
<tr>
<td>:---</td>
<td>\:---\:</td>
<td>\:---\:</td>
<td>:---</td>
</tr>
<tr>
<td>**Payment Webhook Handlers (****`/api/payment/webhook/*`****)**</td>
<td>**100%**</td>
<td>**100%**</td>
<td>Zero tolerance for unverified signature paths or idempotency misses.</td>
</tr>
<tr>
<td>**Booking & Room Concurrency Controllers (****`controllers/`****)**</td>
<td>**90%**</td>
<td>**85%**</td>
<td>Ensures OCC `__v` traps and PCC Redis locks are thoroughly exercised.</td>
</tr>
<tr>
<td>**Auth & RBAC Middleware (****`middleware/auth.js`****)**</td>
<td>**95%**</td>
<td>**95%**</td>
<td>Prevents administrative boundary bypasses across `/admin/*` routes.</td>
</tr>
<tr>
<td>**Frontend Concession Ledgers (****`components/CostBreakdown.jsx`****)**</td>
<td>**95%**</td>
<td>**90%**</td>
<td>Guarantees exact financial math displayed to customers before checkout.</td>
</tr>
</table>