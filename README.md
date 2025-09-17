# Tp_Backend
Trabajo Practico 1 - Manejando el Backend
CASOS DE PRUEBA:
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



Reflexión: Tuve problemas en conectar el servidor, porque no había incluido el método POST, por lo que nada se guardaba en el archivo concepts.json. Además, la página no se abría desde http://localhost:3000/, sino que la abría haciendo doble clic en el archivo HTML. Pude resolverlo agregando la lógica necesaria para el POST y sirviendo la página directamente desde el servidor. Con eso logré que los conceptos se guarden correctamente y que la aplicación funcione accediendo por http://localhost:3000/.