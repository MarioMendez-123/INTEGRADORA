// Clases de la página antes de pintar: ?embed=1 (portada) y ?limpio=1 (presentación).
if (location.search.indexOf("embed=1") >= 0) document.documentElement.classList.add("embed");
if (location.search.indexOf("limpio=1") >= 0) { document.documentElement.classList.add("limpio"); document.documentElement.dataset.theme = "dark"; }
