import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Configuración de Firebase (debe coincidir con lib/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyAI0UkS8vvJ2gUpUU-og3TJ9o7RKVFPUUE",
  authDomain: "espuela-test.firebaseapp.com",
  projectId: "espuela-test",
  storageBucket: "espuela-test.firebasestorage.app",
  messagingSenderId: "1069323850067",
  appId: "1:1069323850067:web:6f1ad6bc071ebb1a4f51a6",
  measurementId: "G-PRHSNVJH4L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeFirestore() {
  console.log('🔥 Inicializando Firestore con datos de prueba...');

  try {
    // 1. Crear usuarios iniciales
    console.log('📝 Creando usuarios...');
    
    await setDoc(doc(db, 'usuarios', 'admin'), {
      user: 'admin',
      pass: '8888',
      nombre: 'Dueño',
      saldo: 0,
      rol: 'admin',
      createdAt: serverTimestamp()
    });

    await setDoc(doc(db, 'usuarios', 'cliente1'), {
      user: 'cliente1',
      pass: '1234',
      nombre: 'Juan Pérez',
      saldo: 500,
      rol: 'cliente',
      createdAt: serverTimestamp()
    });

    await setDoc(doc(db, 'usuarios', 'cliente2'), {
      user: 'cliente2',
      pass: '1234',
      nombre: 'María García',
      saldo: 300,
      rol: 'cliente',
      createdAt: serverTimestamp()
    });

    console.log('✅ Usuarios creados');

    // 2. Crear estado inicial de pelea
    console.log('📝 Creando estado de pelea...');
    
    await setDoc(doc(db, 'config', 'estadoPelea'), {
      numeroPelea: 1,
      cuota: 1.80,
      apuestasAbiertas: false,
      tiempoRestante: 0,
      updatedAt: serverTimestamp()
    });

    console.log('✅ Estado de pelea creado');

    console.log('\n🎉 ¡Firestore inicializado correctamente!');
    console.log('\n📌 Usuarios de prueba:');
    console.log('   Admin: admin / 8888');
    console.log('   Cliente 1: cliente1 / 1234');
    console.log('   Cliente 2: cliente2 / 1234');
    console.log('\n💡 Para usar Firestore, crea un archivo .env.local con:');
    console.log('   NEXT_PUBLIC_USE_FIRESTORE=true');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando Firestore:', error);
    process.exit(1);
  }
}

initializeFirestore();
