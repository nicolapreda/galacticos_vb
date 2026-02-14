# Gallery Sync Documentation

## Overview
 
 Il sistema di sincronismo della gallery automaticamente aggiorna le foto dal drive Nextcloud ogni ora.
 Il processo ora include due step:
 1. **Detection**: Rileva nuove cartelle aggiunte al drive.
 2. **Sync**: Scarica/aggiorna i link delle immagini per tutte le cartelle.
 
 ## Architettura
 
 ### Scripts disponibili
 
 | Script | Comando | Descrizione |
 |--------|---------|------------|
 | `sync-gallery.js` | `npm run sync-gallery` | Sincronizza le immagini per tutte le cartelle in `gallery-folders.json` |
 | `detect-gallery-folders.js` | `npm run detect-gallery-folders` | Rileva automaticamente le nuove cartelle nel drive e le aggiunge a `gallery-folders.json` |
 | `sync-gallery-cron.js` | `npm run sync-gallery-cron` | Esegue **detect + sync** automaticamente ogni ora (minuto 0) |

## Uso Locale (senza Docker)

### Setup iniziale

```bash
# 1. Installare dipendenze (node-cron)
npm install

# 2. Rilevare le cartelle dal drive
npm run detect-gallery-folders

# 3. Sincronizzare le immagini
npm run sync-gallery

# 4. Avviare il sync automatico (in background o in un nuovo terminale)
npm run sync-gallery-cron &
```

### Comandi manuali

```bash
# Sincronizzare una sola volta
npm run sync-gallery

# Verificare i log del cron
tail -f logs/gallery-sync.log
```

## Uso con Docker

### Configuration

Nel `docker-compose.yml`, le seguenti variabili controllano il comportamento:

```yaml
environment:
  - ENABLE_GALLERY_SYNC_CRON=true              # Attiva il cron job (default: true)
  - DETECT_GALLERY_FOLDERS_ON_STARTUP=false    # Rileva cartelle all'avvio (default: false)
  - SYNC_GALLERY_ON_STARTUP=false              # Sincronizza all'avvio (default: false)
  - PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Docker Build e Run

```bash
# Build dell'immagine (con Chromium incluso)
docker build -t galacticosvb .

# Run con sync cron abilitato (default)
docker-compose up -d

# Verificare i log
docker logs -f galacticosvb

# Eseguire il detect manualmente nel container
docker exec galacticosvb npm run detect-gallery-folders

# Eseguire il sync manualmente nel container
docker exec galacticosvb npm run sync-gallery
```

### Opzioni di avvio

**Opzione A: Solo server Next.js (sync disabilitato)**
```yaml
environment:
  - ENABLE_GALLERY_SYNC_CRON=false
```

**Opzione B: Server + Sync automatico ogni ora**
```yaml
environment:
  - ENABLE_GALLERY_SYNC_CRON=true              # ✅ Abilitato
  - DETECT_GALLERY_FOLDERS_ON_STARTUP=false
  - SYNC_GALLERY_ON_STARTUP=false
```

**Opzione C: Server + Detect + Sync automatico ogni ora**
```yaml
environment:
  - ENABLE_GALLERY_SYNC_CRON=true
  - DETECT_GALLERY_FOLDERS_ON_STARTUP=true     # ✅ Rileva cartelle all'avvio
  - SYNC_GALLERY_ON_STARTUP=true               # ✅ Sincronizza all'avvio
```

## Troubleshooting

### Puppeteer non funziona

**Errore:** `Failed to launch the browser`

**Soluzione:** Chromium è installato automaticamente nel Dockerfile. Se il problema persiste, verifica i log:

```bash
docker exec galacticosvb npm run sync-gallery
```

### Gallery non si aggiorna

**Controlla:**
1. Se le nuove cartelle sono in `src/data/gallery-folders.json`:
   ```bash
   docker exec galacticosvb npm run detect-gallery-folders
   ```

2. Sincronizza manualmente:
   ```bash
   docker exec galacticosvb npm run sync-gallery
   ```

3. Verifica i log del cron:
   ```bash
   docker exec galacticosvb tail -f logs/gallery-sync.log
   ```

### Disabilitare il cron job

Se non vuoi che il cron giri automaticamente:

```yaml
environment:
  - ENABLE_GALLERY_SYNC_CRON=false
```

Poi esegui il sync manualmente quando necessario:
```bash
docker exec galacticosvb npm run sync-gallery
```

## File di configurazione

### `src/data/gallery-folders.json`

Contiene la lista delle cartelle da sincronizzare:

```json
[
  {
    "name": "7.2 - OR. CALVENZANO",
    "cover": "https://drive.predanicola.it/apps/files_sharing/publicpreview/...",
    "images": [
      "https://drive.predanicola.it/apps/files_sharing/publicpreview/...",
      ...
    ]
  }
]
```

**Come aggiornare:**
- Manualmente aggiungere le cartelle
- Oppure eseguire `npm run detect-gallery-folders` per aggiungerle automaticamente

## Logs

### Su Docker

```bash
# Logs del container
docker logs -f galacticosvb

# Logs specifici del cron (dentro il container)
docker exec galacticosvb tail -f logs/gallery-sync.log
```

### Localmente

```bash
# Logs del cron
tail -f logs/gallery-sync.log
```

## Performance

- **Primo sync:** 2-5 minuti (a seconda del numero di foto)
- **Sync incrementale:** 30 secondi - 2 minuti
- **Frequenza:** Ogni ora al minuto 0 (es: 14:00, 15:00, 16:00, etc.)

## FAQ

**Q: Cosa succeede se aggiungo una nuova cartella al drive?**
- Esegui: `docker exec galacticosvb npm run detect-gallery-folders`
- Oppure attendi il prossimo riavvio se `DETECT_GALLERY_FOLDERS_ON_STARTUP=true`

**Q: Posso cambiar frequenza del cron?**
- Modifica il pattern in `scripts/sync-gallery-cron.js` linea 42: `schedule.schedule('0 * * * *', ...)`
- `0 * * * *` = ogni ora
- `0 */6 * * *` = ogni 6 ore
- `0 0 * * *` = ogni giorno alle 00:00

**Q: Come faccio se le foto sono molto pesanti?**
- Aumenta il timeout in `sync-gallery.js`: `timeout: 90000` → `timeout: 180000` (3 minuti)
- Oppure sincronizza durante orari di meno picchi (es: di notte)

**Q: Posso sincronizzare solo alcune cartelle?**
- Modifica `src/data/gallery-folders.json` manualmente o rimuovi le cartelle che non servono
