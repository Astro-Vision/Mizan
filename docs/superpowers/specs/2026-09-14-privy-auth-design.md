# Privy Authentication and User Data Design

## Goal

Add passwordless authentication to Mizan with Privy's hosted modal. Users can authenticate by email OTP or wallet, and users without a wallet receive an embedded Ethereum wallet. Authenticated identities are synchronized to the Supabase PostgreSQL database through Prisma.

## Scope

- Add a normalized user and wallet data contract in Prisma.
- Apply the database update to Supabase.
- Integrate `PrivyProvider` at the root application layout.
- Add a login/logout control to the site header.
- Synchronize the authenticated Privy user through a protected server endpoint.

This scope does not add a dashboard, donations, authorization roles beyond the stored `USER` default, or a custom credential form. Privy's modal handles registration and login in one flow.

## Data Model

`User` is the application-level profile. It has an internal numeric primary key and a unique `privyId` containing the Privy DID. Email is optional because wallet-only users might not link an email. Display name and avatar are optional profile fields. The user starts with a `USER` role and includes creation and update timestamps.

`UserWallet` represents each wallet linked to a user. It stores a normalized address, chain, wallet type (`embedded` or `external`), an optional Privy wallet ID, timestamps, and a foreign key to `User`. Address and chain form a unique pair so a wallet cannot belong to multiple users.

The existing example `Post` model remains unchanged. No existing code or data is removed.

## Authentication and Synchronization Flow

1. The root layout wraps the application in the existing Privy provider, configured for email and wallet login methods and automatic embedded Ethereum wallet creation for users without a wallet.
2. A client auth control in the site header opens Privy's modal through `useLogin`. Privy handles first-time registration and recurring login.
3. After authentication or linked-account changes, a client synchronizer gets the Privy identity token and sends it to `POST /api/auth/sync` in a `privy-id-token` header.
4. The route handler uses `@privy-io/node` with the server-only `PRIVY_APP_SECRET` to validate the token and retrieve canonical user data.
5. The handler upserts `User` by Privy DID and replaces the user's wallet records with the verified linked wallet accounts in one database transaction.
6. The client displays an authenticated state and lets the user log out via Privy's SDK.

## Security and Error Handling

- The browser never writes directly to Supabase and never receives `PRIVY_APP_SECRET` or the database URL.
- The server accepts identity data only after Privy verification; it does not trust client-provided email, address, or user ID fields.
- The sync route returns `401` for absent or invalid tokens and `500` for unexpected database or provider failures without exposing secrets.
- Client sync failures are non-blocking for the Privy session, surfaced as a concise UI error with a retry path on the next authenticated render.
- `NEXT_PUBLIC_*` variables contain only browser-safe values. `DATABASE_URL` and `PRIVY_APP_SECRET` remain server-only.

## Files and Verification

Expected changes include `src/prisma/contract.prisma`, generated Prisma contract files, a database migration, the provider/layout, header auth control, the sync route, and a server-only Privy client module.

Verification includes emitting Prisma's contract, applying the database update, TypeScript checking, linting changed files, and manually exercising: email OTP registration, wallet connection, embedded wallet creation, header logout, and one database row per Privy identity with its linked wallets.
