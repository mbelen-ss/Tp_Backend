# Tp_Backend
Trabajo Practico 1 - Manejando el Backend
1) GET /concepts (listar)

Precondicion: Asegurarse que el servidor está corriendo
Paso:
1.En otra terminal ejecutar: Invoke-RestMethod -Method Get http://localhost:3000/concepts | ConvertTo-Json

Resultado esperado: array JSON con objetos { "id", "nombre", "descripcion" }

2) GET /concepts/:id (buscar por id)
Precondicion: Asegurarse que el servidor está corriendo
Paso:
1.En otra terminal ejecutar:Invoke-RestMethod -Method Get http://localhost:3000/concepts/1

Resultado esperado: Objeto JSON con id:1. Si no existe, respuesta 404 con { "error": "not found" }.

3) DELETE /concepts (borrar todo)
Precondicion: Asegurarse que el servidor está corriendo
Paso: 
En otra terminal ejecutar: Invoke-RestMethod -Method Delete http://localhost:3000/concepts

Resultado esperado: { "ok": true, "message": "All deleted" } y luego GET /concepts devuelve [].

4) DELETE /concepts/:id (borrar por id)
Precondicion: Asegurarse que el servidor está corriendo
Paso:
En otra terminal ejecutar: Invoke-RestMethod -Method Delete http://localhost:3000/concepts/1

Resultado esperado: Si existe, { "ok": true, "removed": { ... } }. Si no, { "error": "not found" }.

5) Comportamiento UI

Agregar concepto:

Pasos: 
1.Abrir la página 
2.completar formulario
3.presionar el boton Agregar.

Resultado esperado: El nuevo concepto aparece en la lista de la derecha