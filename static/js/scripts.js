document.addEventListener('DOMContentLoaded', () => {
    const instagram_tile = document.getElementById('instagram_tile');
    const facebook_tile = document.getElementById('facebook_tile');
    const tiktok_tile = document.getElementById('tiktok_tile');
    const linkedin_tile = document.getElementById('linkedin_tile');

    const instagram_username = document.getElementById('input_username_instagram');
    const instagram_password = document.getElementById('input_password_instagram');

    const socialList = document.getElementById('social-list');
    const detailsColumns = document.querySelectorAll('#details-column input, #details-column textarea, #details-column button');
    const userTelefono = document.getElementById('user_telefono');
    const titoloTelefono = document.getElementById('titolo_telefono');
    const locationTelefono = document.getElementById('location_telefono');
    const descrizioneTelefono = document.getElementById('descrizione_telefono');
    const mediaPreview = document.getElementById('mediaPreview');

    // Campi del form
    const titoloInput = document.getElementById('title');
    const locationInput = document.getElementById('location');
    const descrizioneInput = document.getElementById('description');
    const mediaInput = document.getElementById('media');

    // Carica i dati iniziali del telefono
    loadInitialData();

    // Aggiungi listener per i social tiles
    instagram_tile.addEventListener('click', () => toggleSelectSocial(instagram_tile));
    facebook_tile.addEventListener('click', () => toggleSelectSocial(facebook_tile));
    tiktok_tile.addEventListener('click', () => toggleSelectSocial(tiktok_tile));
    linkedin_tile.addEventListener('click', () => toggleSelectSocial(linkedin_tile));

    // Aggiungi listener per gli input del form per aggiornare i dati in tempo reale
    titoloInput.addEventListener('input', () => updatePhoneContent());
    locationInput.addEventListener('input', () => updatePhoneContent());
    descrizioneInput.addEventListener('input', () => updatePhoneContent());
    mediaInput.addEventListener('change', () => updatePhoneContent());

    instagram_tile.addEventListener('click', () => {
    const usernameField = document.getElementById('input_username_instagram');
    const passwordField = document.getElementById('input_password_instagram');
    usernameField.value = instagram_username.value;
    passwordField.value = instagram_password.value;
        });


    function loadInitialData() {
        // Carica i dati iniziali per il telefono (simulazione)
        userTelefono.textContent = 'Utente Telefonico';
        titoloTelefono.textContent = 'Titolo iniziale';
        locationTelefono.textContent = 'Location iniziale';
        descrizioneTelefono.textContent = 'Descrizione iniziale';

        // Inizialmente blocca i dettagli
        detailsColumns.forEach(column => {
            column.disabled = true; // Blocca i dettagli finché non si seleziona un social
        });
    }

    function toggleSelectSocial(tile) {
        const isSelected = tile.classList.toggle('selected');

        if (isSelected) {
            // Abilita le colonne di dettaglio
            detailsColumns.forEach(column => {
                column.disabled = false; // Rimuove il blocco
            });
        } else {
            // Controlla se ci sono altre selezioni
            const selectedItems = document.querySelectorAll('.selected');
            if (selectedItems.length === 0) {
                // Blocca di nuovo se non ci sono selezionati
                detailsColumns.forEach(column => {
                    column.disabled = true;
                });
            }
        }

        // Gestisci il blocco specifico per Instagram
        if (tile === instagram_tile) {
            const usernameLocked = !isSelected;
            instagram_username.classList.toggle('locked', usernameLocked);
            instagram_password.classList.toggle('locked', usernameLocked);
        }

        // Aggiorna i dati del telefono
        updatePhoneContent();
    }

    function updatePhoneContent() {
        // Aggiorna i contenuti del "telefono" in base agli input del form
        titoloTelefono.textContent = titoloInput.value || 'Nessun titolo';
        locationTelefono.textContent = locationInput.value || 'Nessuna location';
        descrizioneTelefono.textContent = descrizioneInput.value || 'Nessuna descrizione';

        // Gestisci il caricamento di immagini/video
        const files = mediaInput.files;
        mediaPreview.innerHTML = ''; // Resetta l'anteprima

        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const mediaItem = document.createElement('div');
                mediaItem.className = 'mediaItem';

                const reader = new FileReader();
                reader.onload = function(e) {
                    if (file.type.startsWith('image/')) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        mediaItem.appendChild(img);
                    } else if (file.type.startsWith('video/')) {
                        const video = document.createElement('video');
                        video.controls = true;
                        video.src = e.target.result;
                        mediaItem.appendChild(video);
                    }
                };
                reader.readAsDataURL(file);
                mediaPreview.appendChild(mediaItem);
            }
        } else {
            mediaPreview.textContent = 'Nessuna immagine/video caricato';
        }
    }

    // Aggiungi listener per aggiornare il contenuto quando il form cambia
    document.getElementById('post-form').addEventListener('input', updatePhoneContent);
    mediaInput.addEventListener('change', updatePhoneContent);
});
