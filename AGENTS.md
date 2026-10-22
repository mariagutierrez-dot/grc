# Reglas de Persistencia y GRC de Global66

## Reglas Críticas del Proyecto (Establecidas por el Usuario)

1. **Inmutabilidad de Riesgos Aprobados u Horas de Catálogo Aceptadas**:
   - Los riesgos que ya han sido **aceptados ("Aprobado" / status: 'Aprobado')** en el catálogo de riesgos son definitivos.
   - **PROHIBIDO** reversar, restaurar a pendiente, modificar los campos de causa/control original o eliminar registros cuyo estado sea `'Aprobado'`.
   - Cualquier cambio futuro solicitado debe ignorar cambios retrospectivos sobre riesgos aprobados para no alterar la matriz consolidada del negocio.

2. **Alineación con ISO 31000 y ROAM**:
   - Clasificar siempre bajo el estándar internacional ISO 31000.
   - Preservar la categorización del tratamiento ROAM (Resolved, Owned, Accepted, Mitigated) con propietarios explícitos.

3. **Colorimetría Estricta del Análisis**:
   - Verde (Bajo), Amarillo (Moderado), Naranja (Alto), Rojo (Extremo).
   - Veredictos de Aceptabilidad obligatorios basados en el nivel de riesgo histórico.

4. **Estricta Evidencia Documental (Cero Invención de Riesgos para Nuevos Productos)**:
   - Para cualquier **nuevo producto** o línea de negocio, la identificación de riesgos debe fundamentarse **exclusivamente en la documentación que el usuario cargue o suministre**.
   - **PROHIBIDO inventar, simular o asumir riesgos** si el usuario no ha provisto la documentación correspondiente.
   - Cuando el usuario solicite un análisis pero **no cargue la información**, se debe **VALIDAR PRIMERO CON EL USUARIO**: consultar de forma explícita si se debe esperar a que cargue la información o si debe basarse en algún documento preexistente específico, antes de crear cualquier registro en la matriz.
