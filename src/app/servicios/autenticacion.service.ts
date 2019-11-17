import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface Usuario {
  uid: string;
  email: string;
  displayName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  uid: string;
  email: string;
  displayName?: string;
  user: Observable<Usuario>;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router) {
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<Usuario>(`users/${user.uid}`).valueChanges()
        } else {
          return of(null)
        }
      })
    )
  }

  async registroUsuario(userdata) {
    const credential = await this.afAuth.auth.createUserWithEmailAndPassword(userdata.email, userdata.password);
    return this.updateUserData(credential.user)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Cuenta Activada',
          text: 'La cuenta ya ha sido activada',
          type: 'success'
        })
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: error.code,
          text: error.message,
          type: 'error'
        });
      });
  }

  async loginUsuario(userdata) {
    const credential = await this.afAuth.auth.signInWithEmailAndPassword(userdata.email, userdata.password);
    return this.updateUserData(credential.user);
  }

  private updateUserData(usuario) {
    const userRef: AngularFirestoreDocument<Usuario> = this.afs.doc(`users/${usuario.uid}`);
    const data = {
      uid: usuario.uid,
      email: usuario.email,
      displayName: usuario.displayName,

    }
    return userRef.set(data, { merge: true });
  }

  signOut() {
    Swal.fire({
      title: 'Seguro que desea cerrar sesion?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, cerrar sesion'
    }).then((result) => {
      if (result.value) {
        this.afAuth.auth.signOut();
        this.router.navigate(['/sesion']);
      }
    });
  }

  alertas(error: any) {
    let titulo: string = '';
    let mensaje: string = '';
    console.log(error.code + '\n' + error.message);
    console.log(error);
    switch (error.code) {
      case 'auth/wrong-password':
        titulo = '¡Error en la contraseña!';
        mensaje = 'La contraseÃ±a introducida es invalida. Asegurate de escribirla correctamente.';
        break;
      case 'auth/user-not-found':
        titulo = '¡Error de autenticacion!';
        mensaje = 'El correo introducido no esta registrado.';
        break;
      case 'auth/invalid-email':
        titulo = '¡Error de correo!';
        mensaje = 'El correo introducido es invalido.';
        break;
      case 'auth/network-request-failed':
        titulo = '¡Error de red!';
        mensaje = 'No se ha podido conectar al servidor. Compruebe su conexion.';
        break;
      case 'auth/too-many-requests':
        titulo = '¡Error en el servidor!';
        mensaje = 'Se han hecho demasiadas peticiones al servidor, por favor espere unos minutos.';
        break;
      case 'auth/email-already-in-use':
        titulo = '¡Correo existente!';
        mensaje = 'El correo introducido ya existe, pruebe a iniciar sesion, o compruebe que no se ha equivocado.';
        break;
      case 'auth/weak-password':
        titulo = '¡Contraseña debil!';
        mensaje = 'La contraseña debe tener 6 caracteres o mas.';
        break;
      case 'auth/user-disabled':
        titulo = '¡Cuenta deshabilitada!';
        mensaje = 'Porfavor contacta con el administrador para informarse, y hacer las preguntas necesarias.';
        break;
      default:
        titulo = error.code;
        mensaje = error.message;
        break;
    }
    Swal.fire({
      icon: 'error',
      title: titulo,
      text: mensaje,
      type: 'error'
    });
  }

  isAuthenticated() {
    const user = this.afAuth.auth.currentUser;
    if (user) {
      return true;
    } else {
      return false;
    }
  }
}
