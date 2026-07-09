# StayWise.ai — Master Ledger of Environment Variables
To prevent "it works on my machine" discrepancies and maintain absolute configuration parity between local development (`localhost`) and cloud production (`Vercel` / `Render` / `AWS ECS`), all secrets, API credentials, and network targets are externalized via environment variables.
---
## 1. Backend Application Layer Secrets (`server/.env`)
These secrets must be injected into the Node.js / Express process via `.env` in local development or cloud provider environment management consoles (`Render Dashboard` / `AWS Secrets Manager`). **NEVER stage or commit these keys to Git per Rule #4.**
<table>
<tr>
<td>Variable Name</td>
<td>Required</td>
<td>Description</td>
<td>Dummy Example Value</td>
</tr>
<tr>
<td>:---</td>
<td>:---</td>
<td>:---</td>
<td>:---</td>
</tr>
<tr>
<td>**`NODE_ENV`**</td>
<td>Yes</td>
<td>Execution environment mode (`development`, `production`, `test`)</td>
<td>`production`</td>
</tr>
<tr>
<td>**`PORT`**</td>
<td>Yes</td>
<td>Network port bound by the Express HTTP server</td>
<td>`5000`</td>
</tr>
<tr>
<td>**`MONGO_URI`**</td>
<td>Yes</td>
<td>MongoDB Atlas clustered connection string with retry configuration</td>
<td>`mongodb+srv://admin:pass_sample@cluster0.atlas.mongodb.net/staywise?retryWrites=true&w=majority`</td>
</tr>
<tr>
<td>**`REDIS_URL`**</td>
<td>Yes</td>
<td>Distributed Upstash or AWS ElastiCache TLS connection string</td>
<td>`rediss://default:sample_auth_token@us1-redis-cloud.upstash.io:31415`</td>
</tr>
<tr>
<td>**`JWT_PRIVATE_SECRET`**</td>
<td>Yes</td>
<td>Cryptographic HMAC 256-bit secret used for signing `staywise_jwt` cookies</td>
<td>`sw_sec_8f93a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9`</td>
</tr>
<tr>
<td>**`STRIPE_SECRET_KEY`**</td>
<td>Yes</td>
<td>Stripe Secret API Key (`sk_test_...` or `sk_live_...`) for generating PaymentIntents</td>
<td>`sk_test_51P5X8kSAMPLESECRETKey987654321`</td>
</tr>
<tr>
<td>**`STRIPE_WEBHOOK_SECRET`**</td>
<td>Yes</td>
<td>Cryptographic HMAC signing secret for `express.raw()` webhook verification</td>
<td>`whsec_sample_secret_key_from_stripe_cli_or_dashboard`</td>
</tr>
<tr>
<td>**`RAZORPAY_KEY_ID`**</td>
<td>Yes</td>
<td>Razorpay Gateway public Key ID</td>
<td>`rzp_test_1234567890ABCD`</td>
</tr>
<tr>
<td>**`RAZORPAY_SECRET`**</td>
<td>Yes</td>
<td>Razorpay Gateway Secret Key for order creation</td>
<td>`sample_razorpay_secret_9988776655`</td>
</tr>
<tr>
<td>**`RAZORPAY_WEBHOOK_SECRET`**</td>
<td>Yes</td>
<td>Cryptographic signature verification key for Razorpay webhooks</td>
<td>`whsec_razorpay_sample_secret_key`</td>
</tr>
<tr>
<td>**`CLOUDINARY_CLOUD_NAME`**</td>
<td>Yes</td>
<td>Cloudinary account identifier for CDN image delivery</td>
<td>`staywise_sample_cloud`</td>
</tr>
<tr>
<td>**`CLOUDINARY_API_KEY`**</td>
<td>Yes</td>
<td>Cloudinary REST API access key for `streamifier` uploads</td>
<td>`889977665544332`</td>
</tr>
<tr>
<td>**`CLOUDINARY_API_SECRET`**</td>
<td>Yes</td>
<td>Cloudinary API Secret for authenticating CDN memory-buffer streams</td>
<td>`sample_cloudinary_api_secret_hash_key`</td>
</tr>
</table>
---
## 2. Frontend Client Presentation Variables (`client/.env.local`)
When building with **Vite**, only environment variables prefixed with **`VITE_`** are bundled and exposed to the browser. **NEVER inject private backend secrets (like ****`STRIPE_SECRET_KEY`**** or ****`MONGO_URI`****) into client variables.**
<table>
<tr>
<td>Variable Name</td>
<td>Required</td>
<td>Description</td>
<td>Dummy Example Value</td>
</tr>
<tr>
<td>:---</td>
<td>:---</td>
<td>:---</td>
<td>:---</td>
</tr>
<tr>
<td>**`VITE_API_BASE_URL`**</td>
<td>Yes</td>
<td>Root target URL for all Axios / Redux Toolkit API dispatches</td>
<td>`https://api.staywise.ai/api` *(Prod)* / `http://localhost:5000/api` *(Dev)*</td>
</tr>
<tr>
<td>**`VITE_STRIPE_PUBLISHABLE_KEY`**</td>
<td>Yes</td>
<td>Stripe Public Key (`pk_test_...` or `pk_live_...`) initialized by `@stripe/stripe-js`</td>
<td>`pk_test_51P5X8kSAMPLEPUBLISHABLEKey12345`</td>
</tr>
<tr>
<td>**`VITE_RAZORPAY_KEY_ID`**</td>
<td>Yes</td>
<td>Razorpay Public Key ID passed to the client checkout modal script</td>
<td>`rzp_test_1234567890ABCD`</td>
</tr>
<tr>
<td>**`VITE_CLOUDINARY_CLOUD_NAME`**</td>
<td>Yes</td>
<td>Public Cloudinary name used for generating client-side responsive image tags</td>
<td>`staywise_sample_cloud`</td>
</tr>
</table>
---
## 3. Local Setup Instructions (`.env.example` Templates)
### `server/.env.example`
```bash
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/staywise_dev
REDIS_URL=redis://localhost:6379
JWT_PRIVATE_SECRET=local_development_jwt_secret_key_change_in_prod

STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
RAZORPAY_KEY_ID=rzp_test_replace_me
RAZORPAY_SECRET=replace_me
RAZORPAY_WEBHOOK_SECRET=replace_me

CLOUDINARY_CLOUD_NAME=replace_me
CLOUDINARY_API_KEY=replace_me
CLOUDINARY_API_SECRET=replace_me
```
### `client/.env.example`
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me
VITE_RAZORPAY_KEY_ID=rzp_test_replace_me
VITE_CLOUDINARY_CLOUD_NAME=replace_me
```