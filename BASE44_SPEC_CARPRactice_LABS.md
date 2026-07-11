# CarPractice Labs — Specifica Base44

## Obiettivo
Rendere dinamica la pagina Labs e gestire progetti, beta tester, idee, reazioni e statistiche.

## Entità
### LabProject
- slug univoco
- nome
- descrizione
- stato: research, concept, prototype, alpha, beta, internal, released
- avanzamento_percentuale
- build
- versione
- dataset_label
- dataset_value
- ultima_build
- visibile
- ordine
- ecosystem_module_slug
- beta_aperta
- created_at / updated_at

### LabExperiment
- slug
- nome
- descrizione
- stato
- visibile
- ordine
- progetto_collegato_id

### LabIdea
- testo
- autore_user_id nullable
- nome
- email
- azienda
- stato: new, review, planned, in_development, released, rejected
- visibile_pubblicamente
- reazioni_totali
- created_at

### LabIdeaReaction
- idea_id
- reaction_type: like, heart, fire, rocket
- user_id nullable
- session_id
- created_at
Vincolo univoco: idea_id + reaction_type + user_id/session_id

### BetaApplication
- user_id nullable
- nome
- email
- azienda
- citta
- riparazioni_mese
- progetto
- stato: new, reviewing, accepted, waitlist, rejected
- note_admin
- created_at

## Funzioni pubbliche
- getPublicLabs
- reactToLabIdea
- submitLabIdea
- applyBetaProgram

## Funzioni admin
- CRUD progetti Labs
- CRUD esperimenti
- moderazione idee
- gestione candidature beta
- statistiche aggregate

## Sicurezza
- CORS solo domini CarPractice e Vercel ufficiale
- rate limit
- honeypot su form
- sanificazione HTML
- idempotenza reazioni
- nessun dato personale esposto pubblicamente

## Endpoint richiesti
- GET /functions/getPublicLabs
- POST /functions/reactToLabIdea
- POST /functions/submitLabIdea
- POST /functions/applyBetaProgram

## Admin
Creare route /admin-labs con:
- progetti
- esperimenti
- idee
- reazioni
- beta tester
- statistiche
- visibilità
- percentuali
- build e versioni

## Test
- candidatura senza login
- candidatura autenticata
- doppia reazione bloccata
- progetto nascosto non pubblico
- aggiornamento live statistiche
- CORS
- rate limit
- mobile
