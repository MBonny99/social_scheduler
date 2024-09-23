from flask import Flask, redirect, request, session, url_for, render_template, send_from_directory
import os
import requests

app = Flask(__name__)
app.secret_key = 'YOUR_SECRET_KEY'

# Configurazione
CLIENT_ID = '543033791718081'
CLIENT_SECRET = 'd635efe6d9e6ea52c7674b075c4b3b58'
REDIRECT_URI = 'http://localhost:5000/callback'
GRAPH_API_URL = 'https://graph.facebook.com/v17.0'

# Step 1: Homepage per l'autenticazione
@app.route('/')
def home():
    # Serve il file index.html dalla root del progetto
    return send_from_directory(os.getcwd(), 'index.html')

# Step 2: Avvia l'autenticazione con Instagram OAuth
@app.route('/login')
def login():
    permissions = 'instagram_basic,pages_show_list,pages_manage_posts'
    instagram_auth_url = (
        f'https://www.facebook.com/v17.0/dialog/oauth?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope={permissions}'
    )

    return redirect(instagram_auth_url)

@app.route('/callback')
def callback():
    code = request.args.get('code')
    token_url = f'{GRAPH_API_URL}/oauth/access_token'
    token_params = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'redirect_uri': REDIRECT_URI,
        'code': code
    }

    token_response = requests.get(token_url, params=token_params).json()
    print(token_response)  # Debugging

    if 'error' in token_response:
        return f"Errore durante la richiesta del token: {token_response['error']}"

    access_token = token_response.get('access_token')
    if not access_token:
        return "Token di accesso non valido."

    session['access_token'] = access_token

    permissions_url = f'{GRAPH_API_URL}/me/permissions?access_token={access_token}'
    permissions_response = requests.get(permissions_url).json()
    print(permissions_response)

    return redirect(url_for('create_post'))

# Step 4: Form per creare un post su Instagram
@app.route('/create_post', methods=['GET', 'POST'])
def create_post():
    if 'access_token' not in session:
        return redirect(url_for('login'))

    if request.method == 'POST':
        caption = request.form['caption']
        image_url = request.form['image_url']
        access_token = session['access_token']

        # Ottenere l'ID della pagina Instagram Business
        user_url = f'{GRAPH_API_URL}/me/accounts?access_token={access_token}'
        pages_response = requests.get(user_url).json()
        print(pages_response)

        if not pages_response.get('data'):
            return "Nessuna pagina trovata", 404

        page_id = pages_response['data'][0]['id']

        # Ottenere l'ID dell'account Instagram Business
        instagram_url = f'{GRAPH_API_URL}/{page_id}?fields=instagram_business_account&access_token={access_token}'
        instagram_response = requests.get(instagram_url).json()

        if 'instagram_business_account' not in instagram_response:
            return "Account Instagram Business non trovato.", 404

        instagram_account_id = instagram_response['instagram_business_account']['id']

        # Creazione del post su Instagram
        media_url = f'{GRAPH_API_URL}/{instagram_account_id}/media'
        media_params = {
            'image_url': image_url,
            'caption': caption,
            'access_token': access_token
        }

        media_response = requests.post(media_url, data=media_params).json()
        print(media_response)  # Debugging

        if 'id' in media_response:
            # Pubblica il media su Instagram
            publish_url = f'{GRAPH_API_URL}/{instagram_account_id}/media_publish'
            publish_params = {
                'creation_id': media_response['id'],
                'access_token': access_token
            }
            publish_response = requests.post(publish_url, data=publish_params).json()
            print(publish_response)  # Debugging

            if 'id' in publish_response:
                return f"Post pubblicato con successo! ID: {publish_response['id']}"
            else:
                return f"Errore nella pubblicazione: {publish_response.get('error', 'Errore sconosciuto')}"
        else:
            return f"Errore nella creazione del media: {media_response.get('error', 'Errore sconosciuto')}"

    return render_template('create_post.html')

if __name__ == '__main__':
    app.run(debug=True)
