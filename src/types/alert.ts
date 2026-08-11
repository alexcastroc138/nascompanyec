export interface Alert {
  id: string;
  tipo: 'STOCK' | 'CAJA' | 'SISTEMA';
  titulo: string;
  mensaje: string;
  emisor: string;
  fecha: string;
  leida: boolean;
}
