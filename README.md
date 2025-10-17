# Desarrollo Web en Entorno Cliente - Prácticas
Repositorio de prácticas para el módulo de Desarrollo Web en Entorno Cliente.

## Gestor de presupuestos
A lo largo de los primeros casos prácticos iremos creando una aplicación de manera iterativa. Dicha aplicación consiste en un __gestor de presupuesto personal__ en el que el usuario podrá ir anotando sus gastos de manera que pueda consultarlos y llevar un seguimiento de los mismos.

De esta manera podremos ir estudiando los fundamentos del lenguaje JavaScript y las herramientas de desarrollo de cliente (/front end/) en el contexto de una aplicación real, donde la mayoría de código que vayamos creando tendrá una función y una utilidad específica dentro de dicha aplicación.

El proceso que llevaremos a cabo está enmarcado dentro del __contexto educativo__, por lo que no debe confundirse con el proceso real de creación de aplicaciones de carácter profesional. En ocasiones se propondrá la creación de varias versiones del mismo código utilizando técnicas distintas, o se tendrán que llevar a cabo rediseños o mejoras para ilustrar nuevos conceptos conforme los vayamos estudiando.

A grandes rasgos, los pasos que seguiremos para la elaboración de la aplicación serán los siguientes:

1. Creación del código y las funciones necesarias para el funcionamiento de la lógica de la aplicación. Se implementará como __librería__, por lo que se limitará a exportar una serie de objetos y funciones exclusivamente.
2. Creación de un __interfaz__ web para mostrar la información de la aplicación en el navegador. En este punto podremos cargar nuestro código en el __navegador web__ y ver los resultados en HTML.
3. Añadir los __controles de formulario__ necesarios para __interactuar__ con la aplicación.
4. Añadir mecanismos de __validación__ para controlar la correcta introducción de datos por parte del usuario.
5. __Almacenar__ los datos de la aplicación en el __navegador web__. Desde este momento el usuario podrá guardar su información en el navegador: al recargar la página aparecerá la información que hubiera introducido (hasta este momento cada vez que se recargaba la página se borraban todos los datos).
6. Conectarse con una __API web__ para almacenar la información del usuario en un __servidor web externo__, incluyendo autenticación de usuario. De esta manera el usuario podrá acceder a sus datos desde cualquier navegador.
7. Utilizar __librerías externas__ para mostrar determinada información de manera __gráfica__ en lugar de texto exclusivamente.
