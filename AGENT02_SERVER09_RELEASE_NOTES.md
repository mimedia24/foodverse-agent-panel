# FoodVerse Agent Panel 02

This build is connected to the Agent APIs included in `server09`.

## Completed

- Agent Dashboard displays the Agent/business identity before any personal name fallback.
- Order Map uses Bangladesh-timezone server filtering for Today, selected date, status and All Dates.
- Order Timeline loads the server-normalized lifecycle for each order.
- Order deletion moves eligible terminal orders to Order Trash; archived orders can be searched and restored.
- Force Close All updates every restaurant in the authenticated Agent zone and shows the server result.
- Popular Restaurant and Popular Menu use zone-owned selections, positions and the corrected server payload.
- Menu approval, platform fee, discount and popular state use server-calculated pricing responses.
- Restaurant, rider and menu images use a shared absolute-URL normalizer and placeholder fallback.
- Rider withdrawal, cash collection and direct earning payment use zone-secured server actions.
- Agent Report uses the same central profit-report endpoint as Main Admin.
- Agent bKash Ledger shows the authenticated zone's historical and current bKash reconciliation.
- Rider registration validates Bangladesh mobile format and JPEG/PNG/WebP files up to 5 MB.
- Sidebar remains scrollable on smaller screens.

## Deployment

1. Deploy/start `server09` first.
2. Deploy this Agent Panel build.
3. Keep `VITE_API_BASE_URL` pointed to the deployed server `/api/v3` base.
4. Set `VITE_IMAGE_API` when image files are served from a separate origin.
5. Keep `VITE_GOOGLE_MAPS_API_KEY` configured for Order Map.

No User App or Rider App source files are included or changed in this package.

## Verification

- `npm ci`
- `npm run lint`
- `npm run build`
- Agent/server contract check for 18 required routes
- 23 relevant server regression tests for Bangladesh dates, bKash, images, menu pricing, Order Trash, Timeline and rider payments
