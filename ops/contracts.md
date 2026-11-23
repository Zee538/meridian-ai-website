# Meridian contract portal: the standard for every client contract

Every client agreement is a private web page the client opens, fills in and signs. The moment they
sign, the page sends the signing to the n8n workflow **Meridian Agreement Signing**, which emails
zion@meridian-aisolutions.com and rinari@meridian-aisolutions.com with the signed PDF attached and logs it
in the **Signed Agreements** data table. A backup copy is also kept under
**Netlify > meridian-agreement-sign > Forms > contract-signature**.

| Piece | Where |
|---|---|
| Portal source | `contracts-portal/` in this repo |
| Hosted on | Netlify project **meridian-agreement-sign** (https://meridian-agreement-sign.netlify.app) |
| Shared look and signing logic | `contracts-portal/assets/contract.css`, `contract.js` |
| One folder per contract | `contracts-portal/c/<client>-<random>/index.html` |
| Team email + signed PDF | n8n workflow **Meridian Agreement Signing** (webhook `meridian-agreement-signed`) |
| Backup record | Netlify form **contract-signature** (one form for all contracts) |

The portal is hidden from search engines (`robots.txt`, `X-Robots-Tag: noindex`), and each contract
lives at a hard-to-guess address. Anyone with the exact link can open it, so only send it to the signer.

## One-time setup (Netlify dashboard)

Done on 23 November 2026: Forms are enabled on meridian-agreement-sign and the n8n workflow is
published. Keep the n8n workflow **published**, or no emails go out. To change who gets the email,
edit the **Email Team** node in that workflow.

1. Deploy the `contracts-portal` folder to that project. Either drag the folder onto
   the project's **Deploys** page, or run `npx netlify-cli deploy --dir=contracts-portal --prod`
   linked to meridian-agreement-sign.

## Adding a new contract

1. Copy an existing contract folder in `contracts-portal/c/` and give it a new name:
   `<client-short-name>-<6 random letters or digits>`, for example `harbour-dental-4k9q2b`.
2. In the new `index.html`:
   - change the `data-contract-id`, `data-contract-title`, `data-client-company` and `data-contract-version` values on `<body>`
   - change the client name, the date in the header band, and the contract text in each section
   - leave the hidden `contract-signature` form exactly as it is
3. Deploy the portal again, and send the client
   `https://meridian-agreement-sign.netlify.app/c/<folder-name>/`.

## When a contract is signed

- Zion and Rinari each get an email with the client's company, name, email, the time of signing,
  the contract id and a fingerprint of the contract text, with the signed PDF attached.
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
