import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig.js';

export default function mostrarRegistro() {
    const app = document.getElementById("app");
    app.innerHTML = `
    <div class="auth-container">
        <h2>📝 Registro</h2>
        <input type="text" id="nombre" placeholder="👤 Nombre completo"><br>
        <input type="email" id="correo" placeholder="📧 Correo electrónico"><br>
        <input type="password" id="contrasena" placeholder="🔒 Contraseña"><br>
        <input type="text" id="fecha" placeholder="📅 Fecha de nacimiento"><br>
        <input type="tel" id="telefono" placeholder="📞 Teléfono"><br>
        <button id="btnRegistro">✅ Registrarse</button>
        <p>¿Ya tienes cuenta? <a href="#" id="linkLogin">Inicia sesión aquí</a></p>
    </div>
    `;

    document.getElementById("btnRegistro").addEventListener("click", async () => {
        const nombre = document.getElementById("nombre").value;
        const correo = document.getElementById("correo").value;
        const contrasena = document.getElementById("contrasena").value;
        const fecha = document.getElementById("fecha").value;
        const telefono = document.getElementById("telefono").value;

        let ganados = 0;
        let perdidos = 0;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
            const user = userCredential.user;

            await setDoc(doc(db, 'usuarios', user.uid), {
                uid: user.uid,
                nombre,
                correo,
                fecha,
                telefono,
                ganados,
                perdidos
            });

            alert('✅ Usuario registrado correctamente');
            // La redirección se maneja automáticamente

        } catch (error) {
            alert('❌ Error al registrarse: ' + error.message);
        }
    });

    document.getElementById("linkLogin").addEventListener("click", (e) => {
        e.preventDefault();
        window.navigateTo('login');
    });
}