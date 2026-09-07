# Ideas y Dudas del Módulo de Pedidos (Revisión del MVP)

## Evaluación del MVP vs Contexto de Negocio

He analizado el archivo `contexto_modulo_pedidos_ia.md` y revisado la implementación del `mvp_pedidos`. A continuación, detallo mis hallazgos desde la perspectiva del **Coordinador del Grupo**:

### ¿Qué cumple el MVP actual?
- **Única Fuente de Verdad (Parcial):** Centraliza la lista en una sola vista.
- **Cálculo Automático de Totales:** La "Curva de Tallas" y el conteo de "Conjuntos Completos" y "Solo Camisetas" se calculan dinámicamente y no pueden ser modificados manualmente, cumpliendo la regla de derivar los totales de los participantes.
- **Interfaz del Coordinador:** Existe una vista dedicada para el Coordinador Operativo para gestionar el pedido.

### ¿Qué NO cumple y necesita mejoras (Acciones para otras IAs)?

*(Nota: Los puntos 1 al 5 ya han sido implementados en gran parte en la primera iteración).*

1. **Unicidad de Números (Bloqueo Faltante):** *[Implementado]*
2. **Bloqueo de Avance por Inconsistencias:** *[Parcialmente Implementado]*
3. **Funcionalidad de Exportación (Botón Sin Acción):** *[Implementado]*
4. **Vistas Diferenciadas (Roles):** *[Implementado]*
5. **Excepciones de Números Repetidos:** *[Implementado]*

---

## Resultados de las Pruebas de Subagentes (Nuevas Mejoras Requeridas)

Tras delegar pruebas a tres subagentes simulando diferentes roles (Coordinador, Jugador y Producción), se han detectado los siguientes fallos o necesidades críticas de negocio que deben incorporarse al MVP:

### 1. Perspectiva del Coordinador (Gestión del Grupo)
- **Control de Pagos:** Falla al no registrar el estado financiero (ej. quién pagó, quién dio adelanto). Esto obliga al coordinador a usar un Excel extra, perdiendo el propósito de la plataforma unificada.
- **Tallas Diferenciadas (Camiseta vs. Short):** Al elegir "Conjunto Completo", solo pide una talla. Si alguien es talla L arriba y M abajo, arruina la curva de tallas automática.
- **Conciliación de Lista (Quién falta):** El sistema muestra el total registrado (ej. 23) pero no permite definir la expectativa total (ej. 25) para mostrar claramente "faltan 2 personas por registrarse".

### 2. Perspectiva de Producción (Diseño y Corte)
- **Fallo en Exportación CSV (Codificación):** El CSV exportado carece del BOM (Byte Order Mark) para UTF-8. Si hay tildes o 'ñ', CorelDRAW o Excel los leerán mal. Además, no escapa correctamente comillas internas.
- **Fallo Crítico en Curva de Tallas:** Sumar una "M de Hombre" y una "M de Mujer" como "2 prendas M" arruina el corte de tela. Se requiere separar urgentemente el conteo y la selección por "Género/Corte".

### 3. Perspectiva del Jugador (Vista Móvil)
- **Falta de Guía de Tallas:** El jugador no sabe qué medidas tiene la "M". Pide a ciegas. Se debe incorporar un enlace a una tabla de medidas.
- **Falta Selección de Corte:** Va de la mano con Producción; en el celular no puede elegir Corte de Hombre/Mujer.
- **Confusión Post-Registro:** Después de enviar el formulario con éxito, el sistema borra los campos tras 4 segundos y los deja en blanco. Esto hace dudar al jugador de si se envió o no. Debería mostrarse un "Recibo" inmodificable.
- **Limpieza de Datos (Trim):** Falla al no aplicar `.trim()` al texto. Nombres con espacios al final podrían causar errores.
