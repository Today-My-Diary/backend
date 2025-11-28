import admin from 'firebase-admin';
import serviceAccount from '../../haru-film-firebase.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export default admin;