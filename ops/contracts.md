# Meridian contract portal: the standard for every client contract

Every client agreement is a private web page the client opens, fills in and signs. The moment they
sign, Netlify emails the signed details and the signature image to Zion and Rinari, and keeps a copy
under **Netlify > meridian-agreement-sign > Forms > contract-signature**.

| Piece | Where |
|---|---|
| Portal source | `contracts-portal/` in this repo |
| Hosted on | Netlify project **meridian-agreement-sign** (https://meridian-agreement-sign.netlify.app) |
| Shared look and signing logic | `contracts-portal/assets/contract.css`, `contract.js` |
| One folder per contract | `contracts-portal/c/<client>-<random>/index.html` |
| Signed submissions | Netlify form **contract-signature** (one form for all contracts) |

The portal is hidden from search engines (`robots.txt`, `X-Robots-Tag: noindex`), and each contract
lives at a hard-to-guess address. Anyone with the exact link can open it, so only send it to the signer.

## One-time setup (Netlify dashboard)

1. Enable **Forms** on the meridian-agreement-sign project (Project configuration > Forms).
2. Add the two email alerts: Project configuration > Notifications > Emails and webhooks >
   **Form submission notifications** > Add notification > **Email notification**.
   Event: *New form submission*. Form: **contract-signature**. One notification for Zion's
   email, and a second one for Rinari's.
3. Deploy the `contracts-portal` folder to that project. Either drag the folder onto
   the project's **Deploys** page, or run `npx netlify-cli deploy --dir=contracts-portal --prod`
   linked to meridian-agreement-sign.

## Adding a new contract

1. Copy an existing contract folder in `contracts-portal/c/` and give it a new name:
   `<client-short-name>-<6 random letters or digits>`, for example `harbour-dental-4k9q2b`.
2. In the new `index.html`:
   - change the `data-contract-id`, `data-contract-title` and `data-client-company` values on `<body>`
   - change the client name, the date in the header band, and the contract text in each section
   - leave the hidden `contract-signature` form exactly as it is
3. Deploy the portal again, and send the client
   `https://meridian-agreement-sign.netlify.app/c/<folder-name>/`.

## When a contract is signed

- Zion and Rinari each get an email with the client's company, name, title, email, the time
  of signing, the contract id and address, and a link to the signature image.
- Countersign, save the signed page as PDF (the page has a "Print or save as PDF" button
  after signing), and email the executed copy to the client.

## Taking a contract down

Delete its folder from `contracts-portal/c/` and deploy again. The old link then shows
"Agreement not found". To take the whole portal offline, delete the deploy or disable the
project in Netlify. Signed submissions stay in the Forms tab until you delete them.

## Limits to know

- This is a simple typed-and-drawn signature with a timestamp, not a certified e-signature
  service. For high-value contracts, have a lawyer review the terms.
- Netlify's free Forms allowance covers a limited number of submissions and uploads per month;
  contract volume is far below it.
