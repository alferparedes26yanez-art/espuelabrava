// Index para seleccionar implementación de servicios (mocks vs Firestore)
import * as Mock from './mock-services';
import * as Firestore from './firestore-services';

const useFirestore = process.env.NEXT_PUBLIC_USE_FIRESTORE === 'true';

// Seleccionar la implementación según la variable de entorno
const services = useFirestore ? Firestore : Mock;

export const authService = services.authService;
export const userService = services.userService;
export const fightService = services.fightService;
export const betService = services.betService;
export const subscribeToChanges = services.subscribeToChanges;

// historialService solo está disponible con Firestore
export const historialService = useFirestore ? Firestore.historialService : null;

export default {
  authService,
  userService,
  fightService,
  betService,
  subscribeToChanges,
  historialService,
};
