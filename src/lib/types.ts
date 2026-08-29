export type RoleId =
  | "administrador"
  | "coordinador_operativo"
  | "vendedora"
  | "coordinador_cliente"
  | "participante"
  | "diseno"
  | "produccion";

export type OrderStatus =
  | "creado"
  | "info_pendiente"
  | "diseno_pendiente"
  | "diseno_revision"
  | "diseno_aprobado"
  | "registro_abierto"
  | "participantes_incompletos"
  | "lista_validacion"
  | "lista_cerrada"
  | "diseno_tecnico"
  | "listo_produccion"
  | "en_produccion"
  | "terminado"
  | "entregado"
  | "cerrado";

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type ParticipantType = "jugador" | "arquero";

export interface OrderComponents {
  camiseta: boolean;
  short: boolean;
  medias: boolean;
  escudo: boolean;
}

export interface OrderConfig {
  tipoCliente: string;
  product: string;
  productOptions: string[];
  quantity: number;
  tela: string;
  collar: string;
  colors: string[];
  components: OrderComponents;
  specialFeatures: string[];
  goalkeeperColors: string[];
  fidelidad?: string;
}

export interface DesignInfo {
  propuesta: string;
  version: string;
  archivo: string;
  estado: "pendiente" | "revision" | "aprobado";
  aprobadoPor?: string;
  fechaAprobacion?: string;
  colores: string[];
}

export interface ProductionInfo {
  metraje: string;
  proveedorTela?: string;
  proveedorCostura?: string;
  notas: string;
}

export interface Costs {
  tela: number;
  impresion: number;
  costura: number;
  bordado: number;
  otros: number;
}

export interface CommercialInfo {
  venta: number;
  adelanto: number;
  cobrado: number;
  saldo: number;
  utilidad: number;
  costs: Costs;
}

export interface PaymentRecord {
  monto: number;
  fecha?: string;
  comprobante?: string;
  estado: "pagado" | "pendiente";
}

export interface Participant {
  id: string;
  fullName: string;
  shirtName: string;
  number: number | null;
  size: Size | null;
  type: ParticipantType;
  product: string;
  goalkeeperColor?: string | null;
  gender?: string;
  escudo?: boolean;
  short?: boolean;
  medias?: boolean;
  observation?: string;
  registrationStatus: "completo" | "pendiente";
  payment: PaymentRecord | null;
  link: string;
  invited: boolean;
}

export interface OrderException {
  id: string;
  participant: string;
  field: string;
  value: string;
  approved: boolean;
  approvedBy?: string;
  requestedBy?: string;
  date: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  user: string;
  role: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface Order {
  id: string;
  code: string;
  client: string;
  contact: string;
  seller: string;
  coordinator: string;
  date: string;
  source: string;
  ghlContactId: string;
  ghlOpportunityId: string;
  status: OrderStatus;
  config: OrderConfig;
  design: DesignInfo;
  production: ProductionInfo;
  commercial: CommercialInfo;
  participants: Participant[];
  exceptions: OrderException[];
  history: HistoryEntry[];
}

export interface Provider {
  id: string;
  name: string;
  service: string;
  rate: string;
  contact: string;
  assignedOrders: string[];
  status: "activo" | "inactivo";
}

export interface Note {
  id: string;
  type: "pedido" | "participante" | "diseno" | "produccion" | "pago";
  level: "error" | "warn" | "info";
  orderId: string;
  orderCode: string;
  text: string;
}

export interface ValidationItem {
  level: "error" | "warn" | "info";
  text: string;
}