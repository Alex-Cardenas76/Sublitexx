# Contexto del Módulo de Pedidos (SIPES) - Para IAs

Este documento define la arquitectura lógica y las reglas de negocio exclusivas del "Módulo Operativo de Pedidos" de Sublitex. Su propósito es proveer contexto claro a cualquier IA que vaya a escribir código, proponer arquitecturas o solucionar bugs en este módulo.

## 1. El Problema a Resolver
Actualmente, los pedidos (camisetas y conjuntos deportivos personalizados) se gestionan por WhatsApp. La información muta y se copia manualmente hacia hojas de cálculo y programas de diseño gráfico (CorelDRAW). Esto produce errores costosos de transcripción (nombres mal escritos, números duplicados, tallas equivocadas, cortes omitidos).

**La Misión:** Crear una "Única Fuente de Verdad". Un dato se registra una vez y fluye sin alteraciones hasta producción.

## 2. Entidades Principales

### 2.1. El Pedido (Order)
Es el contenedor maestro. No existen "listas de camisetas" por un lado y "listas de shorts" por otro. Todo pertenece al pedido.
- **Campos base:** ID interno (ej. `SUB-00842`), Cliente, Coordinador asignado, Estado, Meta de participantes esperados (para conciliación).
- **Configuración Global:** Define qué componentes trae el pedido por defecto (ej. Tipo de Tela: "Win fresh", Conjunto incluye: "Camiseta", "Short", "Escudo").

### 2.2. El Participante (Jugador)
Cada integrante del equipo/pedido. Todo se concentra aquí para evitar listas separadas.
- **Campos Obligatorios:** Nombre principal, Nombre para camiseta (estampado), Número, Talla principal de camiseta, Producto elegido (ej. Solo Camiseta, Conjunto Completo), Género/Corte (Hombre, Mujer, Niño).
- **Campos Condicionales / Desglose:** 
  - **Talla de Short Independiente:** Si el producto es "Conjunto", el jugador puede tener una talla de short diferente a la de la camiseta.
  - **Talla de Medias:** Si el pedido incluye medias.
  - **Arquero (Portero):** Un flag/check indicando si es arquero, ya que esto impacta drásticamente en los colores de producción y a veces en el tipo de prenda (ej. buzo largo).
  - **Escudo:** Check para saber si incluye o no escudo.
- **Gestión (Uso del Coordinador):** 
  - **Estado de Pago:** (Pendiente, Abonado, Pagado) para que el coordinador lleve sus cuentas.
  - **Excepciones:** Cualquier otra modificación que rompa el estándar (ej. "Manga larga").

### 2.3. Excepciones / Personalizaciones Especiales
Atributos que se desvían de la configuración global del pedido.
- Ej. El pedido general tiene mangas cortas, pero un jugador específico requiere "Mangas Largas" o "Nombre de hijos en las mangas". 

## 3. Reglas de Negocio Críticas

1. **Unicidad de Números:** 
   Dentro de un mismo Pedido, dos participantes NO pueden tener el mismo Número de camiseta (a menos que un administrador/coordinador autorice una excepción explícita). El sistema debe validar esto en tiempo real y bloquear el guardado si hay colisión.
2. **Cálculo Automático de Totales y Tallas:**
   Nunca debe permitirse que un usuario ingrese manualmente "Total de camisetas: 15". El sistema debe derivar este número contando los Participantes. Además, la Curva de Tallas debe agruparse considerando el Género/Corte (Una "M" de Hombre no es lo mismo que una "M" de Mujer).
3. **Conciliación de Lista (Quién Falta):**
   El sistema debe poder comparar los jugadores registrados vs la meta esperada y emitir alertas si "Faltan N jugadores" para evitar cierres de lista prematuros.
4. **Control Financiero Interno del Grupo:**
   El Coordinador debe tener un estado de cobranza visible para saber quién le ha pagado y quién le debe, centralizando así toda la gestión en Sublitex.
5. **Bloqueo por Inconsistencias:**
   Un pedido no puede avanzar a producción si hay inconsistencias críticas:
   - Participantes sin talla, sin número o sin nombre.
   - Números duplicados sin autorizar.
   - Cantidad de participantes superior o inferior a la meta.
6. **Roles y Privilegios (Módulo Operativo - Perspectivas):**
   - **Coordinador Operativo (El cliente líder):** Puede gestionar el pedido, modificar listas, cobrar a su grupo y aprobar diseños.
   - **Participante (Jugador):** Solo puede ver su propio registro y modificar su nombre, talla y número a través de una interfaz móvil ultra simple (enlaces únicos, sin contraseña). Debe tener acceso a una Guía de Tallas.
   - **Vendedora:** Cierra la venta y puede ver el estado del pedido, pero se desentiende de la micro-gestión de las tallas de cada jugador.

## 4. Estados Clave del Pedido (Flujo de Vida)
1. `Registro Abierto:` Los participantes pueden ingresar y llenar sus datos.
2. `Lista Cerrada:` Nadie puede modificar datos excepto el Coordinador.
3. `Diseño Aprobado:` El diseño gráfico final ha sido aceptado.
4. `En Producción:` Cualquier cambio de última hora requiere autorización especial (Auditoría estricta).
5. `Entregado.`

## 5. Salida / Output del Sistema
El sistema debe ser capaz de exportar la información estructurada de los participantes (CSV UTF-8, Excel) lista para que el Diseñador pueda utilizarla en la impresión (CorelDRAW), eliminando el 100% del tipeo manual y separando los componentes correctamente (arqueros, cortes de mujer, etc.).
