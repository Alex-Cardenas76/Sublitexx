Requerimiento funcional y técnico 

Sistema de Gestión Operativa de Pedidos Sublitex integrado con GoHighLevel (SIPES)

1. Contexto del proyecto

Sublitex fabrica camisetas, conjuntos deportivos y prendas personalizadas para promociones, colegios, empresas, clubes deportivos y otros grupos.

Actualmente la gestión de los pedidos se realiza mediante una combinación de:

GoHighLevel para la gestión comercial y comunicación con el cliente.

WhatsApp para la coordinación.

Formularios.

Hojas de cálculo.

Mensajes enviados por vendedores.

Listas elaboradas manualmente.

Archivos de CorelDRAW.

Comunicación directa entre ventas, diseño, producción y proveedores.

Este modelo está generando errores, duplicidad de información, pérdida de cambios y dificultad para determinar cuál es la versión definitiva de un pedido.

El problema no está únicamente en la captura de datos. El principal problema es que la información se vuelve a escribir y transformar varias veces durante el proceso.

Ejemplo:

Cliente → WhatsApp → Vendedora → Lista de jugadores → Coordinador → Diseñador → Corel → Producción.

Cada transferencia manual genera posibilidad de error.

Se han detectado casos en los que:

Las cantidades iniciales cambian después de haber enviado una confirmación.

Las tallas cambian durante la coordinación.

Se agregan o eliminan participantes.

Se modifican números.

Se modifican nombres.

Se agregan camisetas o conjuntos posteriormente.

La información final queda dispersa en diferentes conversaciones de WhatsApp.

Se generan diferentes versiones de "resumen de pedido".

Los diseñadores vuelven a escribir manualmente nombres y números.

Se producen errores de digitación que llegan hasta la impresión.

No existe un resumen único y confiable de cantidades por talla.

No existe un resumen automático de camisetas, conjuntos, shorts y medias.

Ventas debe reconstruir manualmente los importes.

Producción debe revisar conversaciones para conocer las cantidades.

No existe una fuente única de verdad.

El administrador debe intervenir constantemente para reconstruir información.

Un ejemplo real de este problema es que un nombre solicitado como "Chapoñán" puede terminar escrito incorrectamente por el diseñador como "Capoñán". Una vez impreso, el error ya no puede corregirse.

2. Objetivo general

Desarrollar un sistema web especializado en la gestión operativa de pedidos de Sublitex que permita centralizar toda la información del pedido y convertirla en una única fuente de verdad para ventas, coordinación, participantes, diseño y producción.

El sistema debe permitir que un dato sea registrado una sola vez y posteriormente reutilizado por las diferentes áreas.

Principio fundamental:

Si un dato ya fue registrado, ningún usuario debería tener que volver a escribirlo.

El sistema debe reducir:

errores de digitación;

errores de cantidades;

errores de tallas;

errores de números;

errores de nombres;

duplicidad de información;

pérdida de cambios;

dependencia de WhatsApp;

trabajo administrativo manual;

tiempo de cotejo;

dependencia del administrador.

3. Objetivo estratégico

El sistema debe permitir delegar la operación diaria a un Coordinador Operativo.

El administrador de Sublitex no debe ser necesario para revisar cada pedido.

Su intervención debería limitarse principalmente a:

decisiones comerciales importantes;

adquisición de clientes;

aprobación de excepciones importantes;

control general;

cobros;

autorización y ejecución de pagos a proveedores.

El Coordinador Operativo debe ser responsable de hacer avanzar los pedidos correctamente.

4. Principio de arquitectura funcional

El sistema debe manejar:

Un único pedido central

No debe existir un "pedido de ventas" y otro "pedido de jugadores".

Debe existir un único:

Pedido #XXXX

Dentro del cual se encuentran:

información comercial vinculada;

configuración del pedido;

diseño;

participantes;

productos;

tallas;

números;

nombres;

pagos de participantes;

producción;

metrajes;

proveedores;

costos internos;

estados.

Los diferentes usuarios accederán a diferentes vistas del mismo pedido dependiendo de sus permisos.

5. Relación con GoHighLevel

5.1. Principio

GoHighLevel continuará siendo el sistema principal para:

leads;

contactos;

conversaciones;

seguimiento comercial;

vendedores;

oportunidades;

pipeline;

cotización comercial;

precio de venta;

adelantos y saldos comerciales, según la configuración actual de Sublitex.

El nuevo sistema será el sistema principal para:

configuración operativa del pedido;

participantes;

tallas;

números;

nombres;

productos;

diseño;

producción;

metrajes;

proveedores;

costos internos;

control operativo.

No se debe duplicar toda la información de un sistema en el otro.

6. Identificador común entre ambos sistemas

Cada pedido creado en el nuevo sistema debe tener un identificador único:

Pedido ID: SUB-000842

Este identificador debe estar relacionado con:

GoHighLevel Contact ID.

GoHighLevel Opportunity ID.

ID interno del pedido.

Ejemplo:

GoHighLevel

    Contact ID: 12345

    Opportunity ID: 98765

             |

             |

             v

Sistema Sublitex

    Pedido ID: SUB-000842

De esta manera ambos sistemas saben que están hablando del mismo pedido.

7. No duplicar el registro comercial

La vendedora no debería registrar nuevamente en el sistema Sublitex:

nombre del cliente;

teléfono;

empresa;

información básica del contacto;

oportunidad comercial.

Esos datos deben venir desde GoHighLevel.

El sistema Sublitex debe consultar o recibir esos datos mediante la integración.

La información operativa específica del pedido se registra en Sublitex.

8. Flujo recomendado de integración con GoHighLevel

Etapa 1 — Cliente en GoHighLevel

La vendedora trabaja normalmente en GoHighLevel.

Etapa 2 — Oportunidad comercial

La oportunidad avanza por el pipeline.

Etapa 3 — Pedido confirmado

Cuando la oportunidad alcanza el estado definido como "Pedido confirmado" o equivalente, GoHighLevel debe notificar al sistema Sublitex.

Etapa 4 — Creación automática del pedido

El sistema Sublitex recibe:

Contact ID.

Opportunity ID.

nombre del cliente;

teléfono;

vendedor;

monto comercial;

información comercial disponible.

Y crea automáticamente:

Pedido SUB-XXXX

Etapa 5 — Operación

Desde ese momento, la operación detallada se realiza en Sublitex.

Etapa 6 — Sincronización de estados

Cuando el pedido avance en Sublitex, determinados estados relevantes deben sincronizarse nuevamente con GoHighLevel.

Ejemplo:

GoHighLevel

Cotización enviada

       ↓

Pedido confirmado

       ↓

Sistema Sublitex

       ↓

Diseño pendiente

       ↓

Diseño aprobado

       ↓

Lista de participantes pendiente

       ↓

Lista completa

       ↓

Producción

       ↓

Terminado

       ↓

Entregado

GoHighLevel no necesita conocer todos los detalles de producción.

Solo debe recibir los estados relevantes para que la vendedora pueda continuar viendo el estado comercial del cliente.

9. Tecnología de integración con GoHighLevel

El equipo deberá utilizar las APIs actuales de HighLevel y no desarrollar una nueva integración basada en V1.

HighLevel dispone actualmente de APIs para contactos y oportunidades, además de webhooks para eventos de creación y actualización.

La integración debe contemplar:

API de GoHighLevel.

Webhooks.

autenticación segura;

sincronización bidireccional;

identificación mediante IDs externos;

manejo de errores;

reintentos;

registro de eventos;

prevención de duplicados.

Para una integración interna puede evaluarse Private Integration, mientras que si se requiere una integración basada en webhooks/OAuth y mayor escalabilidad, debe evaluarse OAuth 2.0. La documentación actual de HighLevel distingue ambos mecanismos.

Antes de comenzar el desarrollo definitivo, el equipo deberá realizar una prueba técnica de integración con la cuenta real de GoHighLevel para validar exactamente qué endpoints, permisos, webhooks y campos serán utilizados.

10. Roles del sistema

10.1. Administrador

Acceso total.

Puede visualizar:

ventas;

pagos;

costos;

proveedores;

costos de costura;

metrajes;

costos de producción;

utilidad;

saldos;

pedidos;

usuarios.

Puede aprobar excepciones y ejecutar decisiones administrativas.

10.2. Coordinador Operativo

Responsable principal de la operación.

Puede:

revisar pedidos;

completar información;

controlar participantes;

revisar datos;

controlar cambios;

gestionar estados;

controlar diseños;

validar listas;

enviar pedidos a diseño;

enviar pedidos a producción;

asignar proveedores;

revisar metrajes;

preparar pagos.

No debería visualizar información comercial sensible que no sea necesaria para su trabajo.

10.3. Vendedora

Puede:

consultar pedidos de sus clientes;

actualizar información comercial;

consultar estado;

modificar información permitida;

consultar participantes cuando sea necesario;

coordinar con el cliente.

Debe conservar GoHighLevel como su herramienta principal de trabajo comercial.

No debe tener que duplicar la información manualmente en Sublitex.

10.4. Coordinador del cliente

Representa al grupo.

Puede:

acceder al pedido;

visualizar diseño aprobado;

administrar participantes;

invitar participantes;

revisar quién completó sus datos;

revisar quién tiene datos pendientes;

revisar estado de pagos de participantes;

ayudar a corregir información.

No puede ver:

costos internos;

margen;

costo de producción;

tarifas de proveedores;

utilidad de Sublitex.

10.5. Participante / Jugador

Debe tener una interfaz extremadamente sencilla y optimizada para teléfono.

No debe requerir una cuenta tradicional con usuario y contraseña.

Debe recibir un enlace temporal o enlace único de acceso.

Ejemplo:

https://sublitex.pe/pedido/842/jugador/xxxxxx

Debe poder registrar únicamente los datos necesarios:

nombre que aparecerá en camiseta;

número;

talla;

producto, si corresponde.

Debe visualizar el diseño aprobado y una previsualización de su personalización.

Si el participante debe pagar al coordinador, podrá:

visualizar el monto correspondiente;

indicar que realizó el pago;

subir voucher;

consultar estado de pago.

10.6. Diseño

Debe recibir exclusivamente información necesaria para diseño y producción.

No debe visualizar:

precio de venta;

margen;

saldo del cliente;

costo de producción;

utilidad.

Debe visualizar:

nombres;

números;

tallas;

productos;

diseño;

características;

excepciones;

cantidades;

información técnica.

10.7. Producción

Debe recibir:

cantidades;

tallas;

productos;

componentes;

diseño aprobado;

información técnica;

metraje;

observaciones.

No debe visualizar información comercial sensible.

11. Módulo de gestión del pedido

El pedido debe contener como mínimo:

Datos generales

ID de pedido;

cliente;

contacto;

vendedor;

coordinador;

fecha;

estado;

origen;

referencia a GoHighLevel.

Configuración del pedido

tipo de cliente;

producto;

cantidad;

tela;

cuello;

diseño;

colores;

componentes;

características especiales.

Diseño

propuesta;

versión;

archivo;

imagen;

estado;

aprobación;

fecha de aprobación.

12. Registro de participantes

Debe existir una única base de participantes dentro de cada pedido.

Cada participante puede tener:

nombre;

nombre para camiseta;

número;

talla;

producto;

género/corte cuando corresponda;

escudo cuando corresponda;

short;

medias;

condición de arquero;

observaciones;

estado de registro;

estado de pago.

No se deben crear listas independientes de camisetas, conjuntos, shorts, etc.

Todas las listas posteriores deben generarse automáticamente a partir de la misma información.

13. Configuración general y excepciones

El pedido debe permitir establecer una configuración general.

Ejemplo:

Conjunto

camiseta: sí;

short: sí;

medias: sí;

escudo: sí.

Los participantes heredan esa configuración.

Si existe una excepción:

Makus — escudo: no

se registra únicamente la excepción.

No se debe crear un formulario diferente para cada tipo de cliente.

El formulario debe ser dinámico según la configuración del pedido.

14. Formulario del participante

Debe ser extremadamente sencillo.

Paso 1

Mostrar diseño aprobado.

Paso 2

Nombre para camiseta.

Paso 3

Número.

Paso 4

Talla.

Paso 5

Previsualización.

Paso 6

Confirmación.

No debe presentar al participante campos técnicos que no necesita conocer.

15. Control de números

El sistema debe controlar automáticamente los números utilizados dentro de cada pedido.

Si el número 10 ya está asignado:

10 — ocupado

No debe permitir que otro participante lo seleccione.

Debe mostrar visualmente:

disponibles;

ocupados;

seleccionado.

El servidor debe realizar una validación de unicidad al momento de guardar, no solamente en la interfaz.

Esto es necesario para evitar que dos personas seleccionen simultáneamente el mismo número.

Debe contemplarse una función administrativa para permitir números repetidos en casos excepcionales.

16. Bloqueo de información

El pedido debe tener estados que determinen cuándo los datos pueden modificarse.

Ejemplo:

Pedido abierto

El participante puede modificar sus datos.

Lista en validación

Los cambios deben ser controlados.

Lista cerrada

Los participantes ya no pueden modificar.

En producción

Los cambios solamente pueden realizarse mediante autorización.

Esto evita modificaciones de última hora que produzcan errores en diseño o producción.

17. Resúmenes automáticos

El sistema debe generar automáticamente:

Resumen general

total de prendas;

total de camisetas;

total de conjuntos;

total de shorts;

total de medias.

Resumen por talla

Ejemplo:

M: 12L: 15XL: 5

Resumen por producto

Camisetas: 17Conjuntos: 12

Resumen por componente

Camisetas: 29Shorts: 12Medias: 12

Resumen de participantes

Completos: 27Pendientes: 2

Nunca se debe realizar este cálculo manualmente.

18. Control de inconsistencias

El sistema debe detectar automáticamente:

números duplicados;

cantidades que no coinciden;

participantes sin talla;

participantes sin número;

participantes sin nombre;

participantes sin producto;

participantes con excepciones no aprobadas;

cantidad de participantes superior a la cantidad contratada;

cantidad de participantes inferior a la cantidad contratada.

Debe existir una sección:

"Problemas pendientes"

Ejemplo:

Pedido SUB-842

[!] Falta talla de Carlos

[!] Número 10 duplicado

[!] Falta confirmar excepción de escudo

[!] Faltan 2 participantes

El pedido no debería poder pasar a producción mientras existan errores críticos.

19. Pagos de participantes

El coordinador del cliente debe poder visualizar:

Participante

Monto

Estado

Pedro

45

Pagado

Juan

45

Pendiente

Carlos

25

Pagado

El participante podrá subir su comprobante.

El sistema debe registrar:

monto;

fecha;

participante;

comprobante;

estado.

El coordinador podrá validar el pago.

Los pagos internos de Sublitex y los pagos de los participantes deben ser conceptos diferentes.

20. Módulo de producción

Una vez cerrada la lista, el sistema debe transformar automáticamente los participantes en información de producción.

Debe generar:

cantidades por talla;

cantidades por producto;

cantidades de camisetas;

cantidades de shorts;

cantidades de medias;

cantidades de escudos;

cantidades especiales;

información de arqueros;

excepciones.

21. Metraje

El diseñador o responsable autorizado debe poder introducir:

Metraje requerido

Ejemplo:

43 metros lineales.

Ese dato debe quedar vinculado al pedido.

El administrador podrá visualizar posteriormente:

metraje;

proveedor;

tarifa;

costo estimado.

Diseño no debe visualizar necesariamente el margen o información financiera global.

22. Proveedores y costos internos

El sistema debe permitir registrar proveedores.

Ejemplo:

Costureros

Proveedor ATarifa conjunto: XTarifa camiseta: XTarifa short: X

Proveedor BTarifa conjunto: XTarifa camiseta: XTarifa short: X

Al seleccionar un proveedor, el sistema debe aplicar automáticamente sus tarifas.

23. Presupuesto interno

El administrador debe poder visualizar:

Costos estimados

Tela: XImpresión: XCostura: XBordado: XOtros: X

Total costo estimado

X

Venta

X

Cobrado

X

Saldo

X

Utilidad estimada

X

Esta información debe estar restringida a los roles autorizados.

24. Diferenciación entre información comercial y operativa

Debe existir una separación clara entre:

Información comercial

precio de venta;

adelanto;

saldo;

descuentos;

utilidad;

margen.

Información operativa

participantes;

tallas;

números;

nombres;

cantidades;

diseño;

producción;

metraje.

Los usuarios de diseño y producción no deben tener acceso a información comercial que no necesitan.

25. Exportación para diseño

En la primera versión no es obligatorio integrar directamente con CorelDRAW.

El MVP debe permitir exportar la información estructurada.

Por ejemplo:

CSV / Excel / JSON.

Con campos como:

nombre

numero

talla

producto

escudo

short

medias

arquero

genero

corte

El objetivo inicial es eliminar el tipeo manual.

Una segunda fase deberá estudiar una integración directa con CorelDRAW o un mecanismo de importación que permita generar automáticamente las personalizaciones.

26. Fuente única de verdad

La información operativa definitiva debe encontrarse en el sistema Sublitex.

No se debe considerar como fuente definitiva:

WhatsApp;

Excel enviado por el cliente;

mensajes de vendedores;

listas copiadas;

archivos manuales del diseñador.

WhatsApp puede continuar utilizándose como canal de comunicación, pero no debe ser la base de datos del pedido.

27. Estados del pedido

Se deberá definir un flujo de estados, inicialmente similar a:

Pedido creado

Información pendiente

Diseño pendiente

Diseño en revisión

Diseño aprobado

Registro de participantes abierto

Participantes incompletos

Lista en validación

Lista cerrada

En diseño técnico

Listo para producción

En producción

Terminado

Entregado

Cerrado

El equipo deberá revisar y ajustar estos estados antes de comenzar el desarrollo.

28. Notificaciones

El sistema deberá generar alertas para situaciones como:

faltan participantes;

faltan datos;

número duplicado;

diseño pendiente de aprobación;

lista pendiente de cierre;

participante pendiente de pago;

pedido listo para producción;

metraje pendiente;

proveedor pendiente;

pedido bloqueado por inconsistencia.

Las notificaciones pueden evolucionar posteriormente hacia WhatsApp, correo u otros canales.

29. Integración futura con WhatsApp

No es requisito obligatorio del primer MVP.

Sin embargo, la arquitectura debe permitir posteriormente enviar automáticamente:

enlace al participante;

recordatorio de completar datos;

recordatorio de pago;

aviso de cierre de lista;

confirmación de pedido.

La integración deberá aprovechar los mecanismos disponibles en GoHighLevel cuando corresponda.

30. Auditoría

El sistema debe guardar historial de cambios.

Ejemplo:

Chapoñán

Talla M → L

Modificado por: Coordinador

Fecha: 24/08/2026

También:

Número 11

Pedro → Carlos

Esto es fundamental porque uno de los problemas actuales es determinar quién modificó un dato y cuál era la versión anterior.

31. Arquitectura tecnológica inicial

Se propone inicialmente:

Frontend

Next.jsTypeScript

Backend

DjangoDjango REST Framework

Base de datos

PostgreSQL mediante Supabase.

Infraestructura

Hetzner.

Integración

GoHighLevel API + Webhooks.

Arquitectura

Para el MVP se recomienda un monolito modular, no microservicios.

Estructura conceptual:

Next.js

   |

   v

Django REST API

   |

   +---- Pedidos

   +---- Participantes

   +---- Diseños

   +---- Producción

   +---- Proveedores

   +---- Costos

   +---- Usuarios

   +---- Auditoría

   |

   v

PostgreSQL / Supabase

Y:

GoHighLevel

     |

 API / Webhooks

     |

     v

Django

No se recomienda introducir microservicios en el MVP porque aumentarían innecesariamente la complejidad del proyecto.

32. MVP — Alcance obligatorio

La primera versión debe incluir:

usuarios;

roles;

pedidos;

integración básica con GoHighLevel;

vinculación Contact ID / Opportunity ID;

configuración del pedido;

diseño;

aprobación de diseño;

participantes;

formulario simplificado;

tallas;

nombres;

números;

validación de números duplicados;

productos;

excepciones;

cierre de lista;

pagos de participantes;

comprobantes;

resúmenes automáticos;

validaciones;

historial de cambios;

exportación de información para diseño;

estados del pedido.

33. Fuera del MVP

No debe formar parte de la primera versión:

editor gráfico completo;

sistema de votación;

catálogo complejo de diseños;

inteligencia artificial;

integración avanzada con CorelDRAW;

automatización completa de WhatsApp;

cálculo automático de metraje;

microservicios;

aplicación móvil nativa;

contabilidad completa;

ERP financiero completo.

Estos elementos pueden incorporarse posteriormente.

34. Fase posterior

Después de validar el MVP se podrá incorporar:

Fase 2

integración con CorelDRAW;

generación automática de archivos;

automatización de WhatsApp;

cálculo de metraje;

costos automáticos;

tarifas de proveedores;

órdenes de producción.

Fase 3

planificación de producción;

inventario;

compras;

proveedores;

pagos;

rentabilidad;

dashboards.

Fase 4

automatización avanzada;

IA;

generación de diseños;

detección de inconsistencias;

automatización completa del flujo.

35. Requisito fundamental de usabilidad

El sistema debe ser diseñado principalmente para teléfonos móviles en el caso de:

participantes;

coordinadores de clientes.

El participante debe poder completar su información en menos de un minuto.

No debe necesitar capacitación.

El coordinador debe poder administrar un pedido desde su teléfono.

El personal interno podrá disponer de interfaces de escritorio más completas.

36. Resultado esperado

Al finalizar el MVP, el flujo debe aproximarse a:

CLIENTE

   |

   v

GOHIGHLEVEL

   |

   | Pedido confirmado

   v

SISTEMA SUBLITEX

   |

   +---- Diseño

   |

   +---- Coordinador

   |

   +---- Participantes

   |        |

   |        +---- Nombre

   |        +---- Número

   |        +---- Talla

   |        +---- Pago

   |

   v

LISTA ÚNICA Y VALIDADA

   |

   v

DISEÑO

   |

   v

PRODUCCIÓN

   |

   +---- Metraje

   +---- Costura

   +---- Bordado

   +---- Impresión

   |

   v

PEDIDO TERMINADO

El objetivo final es que desaparezca el flujo actual:

WhatsApp

   ↓

copiar

   ↓

pegar

   ↓

Excel

   ↓

volver a copiar

   ↓

Corel

   ↓

volver a escribir

   ↓

producción

y sea reemplazado por:

DATO REGISTRADO UNA VEZ

          ↓

     BASE CENTRAL

          ↓

 ┌────────┼────────┐

 ↓        ↓        ↓

VENTAS  DISEÑO  PRODUCCIÓN

          ↓

       RESULTADO

37. Primera tarea del equipo de desarrollo

Antes de comenzar a programar, el equipo deberá entregar:

Mapa del proceso actual.

Mapa del proceso futuro.

Matriz de roles y permisos.

Modelo entidad-relación de la base de datos.

Diagrama de integración con GoHighLevel.

Definición de estados del pedido.

Wireframes de las principales pantallas.

Prototipo del flujo del participante.

Prueba técnica de conexión con GoHighLevel.

Backlog del MVP dividido en historias de usuario.

Criterios de aceptación de cada historia.

Plan de desarrollo por iteraciones.

No deberá comenzar el desarrollo completo hasta validar estos elementos.

38. Criterio principal de éxito

El sistema será considerado exitoso si logra que un pedido pueda pasar desde GoHighLevel hasta producción sin que una persona tenga que volver a copiar manualmente los nombres, números, tallas y cantidades entre WhatsApp, Excel y Corel.

El indicador más importante no será la cantidad de funcionalidades desarrolladas.

Será:

¿Cuántas veces tuvo que volver a escribir una persona un dato que ya estaba registrado?

El objetivo debe ser:

Una sola vez.

ANEXOS

Aqui van los ejemplos de casos de como se envian actualmente las confirmaciones de pedido de forma manual por whatsapp lo cala es muy ineficiente 

Ejemplo 1

“CONFIRMACIÓN DE PEDIDO

Cantidad: 16 conjuntos (jugador) y 1 conjunto (arquero) - 8 camisetas (jugador) y 1 (arquero)  | 26 unidades

Precio unitario: S/45 - 25

Total: S/ 1150

Tallas, nombres y números:

CONJUNTOS

Talla M

ANMIX BRENIS - Talla M - N° 7

J. HUANCAS - Talla M - N° 7

BANCES - Talla M - N° 17

VENTURA - Talla M - N° 9

HEINER - Talla M - N° 12

JH KL RAMOS - Talla M - N° 15

JORGE C. - Talla M - N° 7

C. ACOSTA - Talla M - N° 9

Talla L

LADINES - Talla L - N° 3

TAPIA - Talla L - N° 23

GUSTAVO R. - Talla L - N° 11

CALDERON - Talla L - N° 14

ALAN F. - Talla L - N° 8

ALAN R. - Talla L - N° 7

FLORES - Talla L - N° 30

Talla XL

CLINT - Talla XL - N° 69

HA.LI - Talla XL - N° 119

CAMISETAS

Talla 10

THEO - Talla 10 - N° 69

Talla 14

THIAGO R. - Talla 14 - N° 8

Talla S

AMPARO - Talla S - N° 4

TOGUE - Talla S - N° 8

MIRTHA - Talla S - N° 23

Talla M

ANA LI - Talla M - N° 11

LOCONI - Talla M - N° 98

HADA - Talla M - N° 8

Talla XL

CLINT - Talla XL - N° 69

Detalles:

Tela: Win fresh

Diseño: Según fotos de referencia.

Pecho: "PROMO 2002", Insignia bordada y Sponsors

Short: Insignia lado derecho, número lado izquierdo

Espalda: Nombre, Número, sponser

Short atrás: Sponser

Brazo derecho: Nombre Hijo, Insignia del campeonato

Brazo Izquierdo: Nombre Hijo, Copa con frase (COPA 2026)

Personalización especial: Camisetas de CLINT TALLA XL (N° 69) lleva nombres de hijos en los brazos y nombre de esposa en cuello delantero. (Una conjunto blanca y una camiseta azul azul).

Buenas noches, me indica si todo está conforme para proseguir con la confirmación del pedido.

”

El  cliente hizo modificaciones y se le envio otra confirmacion: 

“CONFIRMACIÓN DE PEDIDO

Cantidad total: 26 unidades

Conjuntos completos: 17

Camisetas: 9

Precios unitarios:

Conjunto completo: S/ 45

Camiseta: S/ 25

Total: S/ 1,150

Tallas, nombres y números:

COLOR BLANCO:

Conjuntos – 16 unidades

Talla M

ANMIX BRENIS – N.° 7 

J. HUANCAS – N.° 7 

BANCES – N.° 17 

VENTURA – N.° 9 

JHEINER – N.° 12 

JH KL RAMOS – N.° 15 

JORGE C. – N.° 7 

C. ACOSTA – N.° 10 

Talla L

LADINES – N.° 3 

GUSTAVO R. – N.° 11 

CALDERON – N.° 14 

ALAN F. – N.° 8 

ALAN R. – N.° 7 

FLORES – N.° 30 

Talla XL

CLINT – N.° 69 

HA.LI – N.° 119 

Camisetas – 8 unidades

THEO – Talla 10 – N.° 69 

THIAGO R. – Talla 14 – N.° 8 

AMPARO – Talla S – N.° 4 

TOGUE – Talla S – N.° 8 

MIRTHA – Talla S – N.° 23 

ANA LI – Talla M – N.° 11 

LOCONI – Talla M – N.° 98 

HADA – Talla M – N.° 8 

COLOR AZUL:

Conjunto completo – 1 unidad

TAPIA – Talla L – N.° 23 

Camiseta – 1 unidad

CLINT – Talla XL – N.° 69 

DETALLES DEL PEDIDO:

Tela: Win Fresh

Diseño: Según modelo aprobado por WhatsApp

Colores: Blanco y azul

Parte delantera de la camiseta: Texto "PROMO 2002", Insignia del colegio bordada y Sponsors correspondientes 

Short delantero: Insignia del colegio en el lado derecho y Número en el lado izquierdo 

Espalda: Nombre, Número y Sponsor 

Short posterior: Sponsors correspondientes 

Manga derecha: Insignia del campeonato 

Manga izquierda: Copa y texto "COPA 2026" 

Personalización especial:

•Nombres de los hijos en las mangas 

•Nombre de la esposa en la parte delantera del cuello 

Se aplicará al conjunto blanco y una camiseta azul de CLINT –  N.° 69

PAGO:

Adelanto: S/ 575

Saldo: S/ 575

ENTREGA:

Modalidad: Envío a provincia por Shalom

Fecha acordada: 18 de agosto de 2026

Durante los días previos a la entrega se enviará una fotografía del avance o del producto terminado

”

Luego el cliente siguei haciendo ajuste o agregando datos 

“[9:21 a. m., 7/8/2026] +51 966 826 524: N° 12

Juan R.

Johnatan

Kalessi

Diego

[9:22 a. m., 7/8/2026] +51 966 826 524: Juan R.  (Nombre principal) 

Kalessi (abajo del cuello)

Y los nombres de varón uno en cada barzo

Y el número de polo 12

[9:22 a. m., 7/8/2026] +51 966 826 524: Ese es el último cambio

”

al final de esto se envia una ultima confirmaciond  de pedido

“CONFIRMACIÓN DE PEDIDO

Cantidad total: 26 unidades

Conjuntos completos: 17

Camisetas: 9

Precios unitarios:

Conjunto completo: S/ 45

Camiseta: S/ 25

Precio adicional (Banderola): S/ 25

Total: S/ 1,175

Tallas, nombres y números:

COLOR BLANCO (MANGA CORTA):

Conjuntos – 16 unidades

Talla M

ANMIX BRENIS – N.° 7

J. HUANCAS – N.° 7

BANCES – N.° 17

VENTURA – N.° 9

JHEINER – N.° 12

JUAN R. – N.° 12

JORGE C. – N.° 7

C. ACOSTA – N.° 10

Talla L

LADINES – N.° 3

GUSTAVO R. – N.° 11

CALDERON – N.° 14

ALAN F. – N.° 8

ALAN R. – N.° 7

FLORES – N.° 30

Talla XL

CLINT – N.° 69

HA.LI – N.° 119

Camisetas – 8 unidades

THEO – Talla 10 – N.° 69

THIAGO R. – Talla 14 – N.° 8

AMPARO – Talla S – N.° 4

TOGUE – Talla S – N.° 8

MIRTHA – Talla S – N.° 23

ANA LI – Talla M – N.° 11

LOCONI – Talla M – N.° 98

HADA – Talla M – N.° 8

COLOR AZUL (MANGA CORTA):

Conjunto completo – 1 unidad

TAPIA – Talla L – N.° 23

Camiseta – 1 unidad

CLINT – Talla XL – N.° 69

DETALLES DEL PEDIDO:

Tela: Win Fresh

Diseño: Según modelo aprobado por WhatsApp

Colores: Blanco y azul

Parte delantera de la camiseta: Texto "PROMO 2002", Insignia del colegio bordada y Sponsors correspondientes

Short delantero: Insignia del colegio en el lado derecho y Número en el lado izquierdo

Espalda: Nombre, Número y Sponsor

Short posterior: Sponsors correspondientes

Manga derecha: Insignia del campeonato

Manga izquierda: Copa y texto "COPA 2026"

Personalización especial:

* Nombres de los hijos en las mangas

* Nombre de la esposa en la parte delantera del cuello

Se aplicará al conjunto blanco y una camiseta azul de CLINT – N.° 69, y conjunto Blanco de JUAN R. - N°12

PAGO:

Adelanto: S/ 587.5

Saldo: S/ 587.5

ENTREGA:

Modalidad: Envío a provincia por Shalom

Fecha acordada: 18 de agosto de 2026

Durante los días previos a la entrega se enviará una fotografía del avance o del producto terminado.

”

a pesar  de esto la recepcionista no logra incluir algunos datos que se habia acordado en el whatsapp 

pero luego el cliente hace mas cambios

enviandole la ultima confirmacion de pedido “CONFIRMACIÓN DE PEDIDO

Cantidad total: 28 unidades

Conjuntos completos: 17

Camisetas: 11

Precios unitarios:

Conjunto completo: S/ 45

Camiseta: S/ 25

Precio adicional (Banderola): S/ 25

Total: S/ 1,225

Tallas, nombres y números:

COLOR BLANCO (MANGA CORTA):

Conjuntos – 16 unidades

Talla M

ANMIX BRENIS – N.° 7

J. HUANCAS – N.° 7

BANCES – N.° 17

VENTURA – N.° 9

JHEINER – N.° 12

JUAN R. – N.° 12

JORGE C. – N.° 7

C. ACOSTA – N.° 10

Talla L

LADINES – N.° 3

GUSTAVO R. – N.° 11

CALDERON – N.° 14

ALAN F. – N.° 8

ALAN R. – N.° 7

FLORES – N.° 30

Talla XL

CLINT – N.° 69

HA.LI – N.° 119

Camisetas – 8 unidades

THEO – Talla 10 – N.° 69

THIAGO R. – Talla 14 – N.° 8

AMPARO – Talla S – N.° 4

TOGUE – Talla S – N.° 8

MIRTHA – Talla S – N.° 23

ANA LI – Talla M – N.° 11

LOCONI – Talla M – N.° 98

HADA – Talla M – N.° 8

PATRICIA A. – Talla M – N°10

CYNTHIA – Talla L – N°25

COLOR AZUL (MANGA CORTA):

Conjunto completo – 1 unidad

TAPIA – Talla L – N.° 23

Camiseta – 1 unidad

CLINT – Talla XL – N.° 69

DETALLES DEL PEDIDO:

Tela: Win Fresh

Diseño: Según modelo aprobado por WhatsApp

Colores: Blanco y azul

Parte delantera de la camiseta: Texto "PROMO 2002", Insignia del colegio bordada y Sponsors correspondientes

Short delantero: Insignia del colegio en el lado derecho y Número en el lado izquierdo

Espalda: Nombre, Número y Sponsor

Short posterior: Sponsors correspondientes

Manga derecha: Insignia del campeonato

Manga izquierda: Copa y texto "COPA 2026"

Personalización especial:

* Nombres de los hijos en las mangas

* Nombre de la esposa en la parte delantera del cuello

Se aplicará al conjunto blanco y una camiseta azul de CLINT – N.° 69, y conjunto Blanco de JUAN R. - N°12

PAGO:

Adelanto: S/ 587.5

Saldo: S/ 637.5

”

al final se le envio las camisetas a chiclayo des peude 2 diasre recibido viene la quejas son los siguientes:

“Amigo los polos de mujer no tienen el corte especial para mujeres” hay ver si eso esta en la confirmacion de pedido“Todos los polos son rectos hasta las de las mujeres

Amigo y el xl me queda apretado en el pecho no me entra, yo te pedi XXL” 