# WinterWish

Make Christmas More Magical. React + Vite + Tailwind frontend, Firebase backend, Netlify hosting.

## Run locally
```
npm install
cp .env.example .env   # fill in your Firebase web config
npm run dev
```

## Status
- Phase 1-2 done: scaffold, design system, landing, find group, password gate, group dashboard, member wishlist.
- Next: Cloud Functions + Firestore rules (Phase 4 contract below), admin UI, deployment guide.

## Cloud Function contract used by the public pages
All are callable functions. Public pages never read Firestore directly.

| Function | Input | Returns |
|---|---|---|
| searchGroups | {query} | [{groupCode, groupName, partyDate (ISO), memberCount}] active groups only; empty query lists active groups |
| getGroupPreview | {groupCode} | {groupCode, groupName, partyDate, memberCount}; not-found if archived |
| verifyGroupPassword | {groupCode, password} | {token, expiresAt (epoch ms)}; permission-denied if wrong, resource-exhausted if rate limited |
| getGroupContent | {groupCode, token} | {group:{groupName, description, partyDate}, members:[{id, fullName, photoURL, wishlist:[{id, itemName, description, productLink, imageURL, priority, sortOrder}]}]}; unauthenticated if token invalid or for another group |

Netlify: build `npm run build`, publish `dist`. `public/_redirects` handles SPA routes.
