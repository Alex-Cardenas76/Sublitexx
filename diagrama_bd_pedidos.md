# Diagrama de Base de Datos (Módulo de Pedidos SIPES)

Este es el Diagrama Entidad-Relación (E-R) basado en la lógica de negocio que construimos para el MVP.

```mermaid
erDiagram
    PEDIDO ||--o| DISENO : configura
    PEDIDO ||--|{ PARTICIPANTE : contiene
    PEDIDO ||--o| PRODUCCION : calcula_costos
    TALLER ||--o{ PRODUCCION : es_asignado_a

    PEDIDO {
        string id_pedido PK
        string ghl_opportunity_id
        string nombre_equipo
        string nombre_coordinador
        string estado_actual
        int meta_participantes
        float precio_venta_acordado
        date fecha_creacion
    }

    DISENO {
        int id PK
        string id_pedido FK
        string url_mockup
        string tipo_tela
        string tipo_cuello
        string color_principal
        string color_secundario
        string conf_arquero
        string auspiciadores
        string estado
    }

    PARTICIPANTE {
        int id PK
        string id_pedido FK
        string nombre_jugador
        string nombre_camiseta
        int numero_camiseta
        string talla_arriba
        string talla_abajo
        string corte_genero
        string tipo_producto
        boolean es_arquero
        string estado_pago
        string excepciones
    }

    PRODUCCION {
        int id PK
        string id_pedido FK
        int id_taller FK
        float metros_tela_requeridos
        float costo_por_metro
        float costos_fijos_extra
        float costo_total_confeccion
        float utilidad_neta_estimada
    }

    TALLER {
        int id PK
        string nombre_taller
        float costo_costura_camiseta
        float costo_costura_short
    }
```

### Explicación de las Relaciones Cardinales:
1. **PEDIDO a PARTICIPANTE (1 a Muchos):** Un pedido tiene muchos jugadores.
2. **PEDIDO a DISEÑO (1 a 1):** Un pedido tiene una única configuración gráfica y mockup aprobado.
3. **PEDIDO a PRODUCCIÓN (1 a 1):** Cada pedido tiene una única hoja de costos y rentabilidad.
4. **TALLER a PRODUCCIÓN (1 a Muchos):** Un Taller puede ser asignado a fabricar múltiples pedidos distintos.
