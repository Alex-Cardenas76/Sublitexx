---
trigger: always_on
---

# Reglas Obligatorias para Inteligencias Artificiales (Workspace Rules)

**¡ATENCIÓN IA!** Si acabas de ser instanciada en este espacio de trabajo, debes leer y cumplir estrictamente las siguientes reglas antes de sugerir código, modificar archivos o planificar arquitecturas.

## 1. Misión del Espacio de Trabajo
El objetivo actual es desarrollar y perfeccionar el **MVP del Módulo Operativo de Pedidos (SIPES)** para Sublitex. La meta es crear una "única fuente de verdad" que elimine el caos de WhatsApp, la duplicidad de información y los errores manuales de tipeo al momento de generar listas de producción y diseño gráfico.
**ADVERTENCIA:** Bajo ninguna circunstancia debes proponer características, bases de datos o código para módulos de ventas, inventario, finanzas o catálogos externos. Limítate ESTRICTAMENTE al Módulo de Pedidos.

## 2. Restricción Estricta: NO GoHighLevel
- **PROHIBIDO** incluir lógicas, integraciones, menciones o sugerencias relacionadas con "GoHighLevel" o CRMs externos. 
- Este MVP está completamente aislado. Solo nos enfocamos en la lógica interna del pedido: Coordinadores, Participantes (Jugadores), Números, Tallas y Totales.

## 3. Stack Tecnológico del MVP
- **Frontend actual:** Vanilla HTML, CSS Puro y Vanilla JavaScript (`/mvp_pedidos/`).
- **PROHIBIDO** instalar o sugerir frameworks como React, Vue, Next.js, Tailwind CSS o librerías pesadas a menos que el usuario humano (`USER`) lo apruebe explícitamente.
- **Diseño visual:** Debe mantenerse un estándar "Premium". Usa estilos modernos, Glassmorphism, animaciones suaves y tipografía limpia (Inter). Nada de MVPs feos o genéricos.

## 4. Reglas de Negocio Intocables
- **Unicidad:** Nunca permitas que dos jugadores en un mismo pedido tengan el mismo número sin alertar de una colisión.
- **Cálculo Derivado:** Los totales de prendas (camisetas, conjuntos, curvas de tallas) SIEMPRE deben ser calculados dinámicamente sumando las filas de los participantes. Nunca crear campos para ingresar "Total de camisetas" de forma manual.
- **Simplicidad:** La interfaz del Participante debe ser a prueba de tontos (usable en móvil, sin contraseñas). La del Coordinador debe ser un dashboard eficiente.

## 5. Documentación de Referencia
Antes de modificar la lógica de negocio, estás obligada a leer:
1. `contexto_modulo_pedidos_ia.md`: Para entender a fondo cómo funciona un pedido de Sublitex.
2. `ia_ideas_y_dudas.md`: Para revisar si otras IAs han dejado notas, problemas conocidos o sugerencias. Deja tus propios comentarios allí si encuentras cuellos de botella.

---
*Fin de las instrucciones. Procede a ayudar al humano con estas directrices en tu contexto.*
