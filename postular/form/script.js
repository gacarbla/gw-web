var log;
var loggeduser;

async function returnLoggedUser() {
    return loggeduser
}

window.onload = async function () {

    var países = ["Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda", "Arabia Saudita", "Argelia", "Argentina", "Armenia", "Australia", "Austria", "Azerbaiyán", "Bahamas", "Bangladés", "Barbados", "Baréin", "Bélgica", "Belice", "Benín", "Bielorrusia", "Birmania", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Bután", "Cabo Verde", "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", "Chipre", "Ciudad del Vaticano", "Colombia", "Comoras", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Granada", "Grecia", "Guatemala", "Guyana", "Guinea", "Guinea ecuatorial", "Guinea-Bisáu", "Haití", "Honduras", "Hungría", "India", "Indonesia", "Irak", "Irán", "Irlanda", "Islandia", "Islas Marshall", "Islas Salomón", "Israel", "Italia", "Jamaica", "Japón", "Jordania", "Kazajistán", "Kenia", "Kirguistán", "Kiribati", "Kuwait", "Laos", "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo", "Madagascar", "Malasia", "Malaui", "Maldivas", "Malí", "Malta", "Marruecos", "Mauricio", "Mauritania", "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia", "Montenegro", "Mozambique", "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Noruega", "Nueva Zelanda", "Omán", "Países Bajos", "Pakistán", "Palaos", "Palestina", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polonia", "Portugal", "Reino Unido", "República Centroafricana", "República Checa", "República de Macedonia", "República del Congo", "República Democrática del Congo", "República Dominicana", "República Sudafricana", "Ruanda", "Rumanía", "Rusia", "Samoa", "San Cristóbal y Nieves", "San Marino", "San Vicente y las Granadinas", "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia", "Seychelles", "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka", "Suazilandia", "Sudán", "Sudán del Sur", "Suecia", "Suiza", "Surinam", "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Yibuti", "Zambia", "Zimbabue"]
    document.getElementById("paises").innerHTML = `<option value="${países.join('">\n<option value="')}">`


    var input_fields = document.querySelectorAll(".input > input")

    input_fields.forEach(field => {
        field.addEventListener("input", function(e) {
            if (e.target.value.length>0) {
                e.target.parentNode.classList.add("filled")
            }
        })
        field.addEventListener("focusin", function(e) {
            e.target.parentNode.classList.add("filled")
        })
        field.addEventListener("focusout", function(e) {
            if (e.target.value.length==0)
            e.target.parentNode.classList.remove("filled")
        })
        if (field.value.length>0) {
            field.parentNode.classList.add("filled")
        }
    })
    
    var list_fields = document.querySelectorAll(".list > input")

    list_fields.forEach(field => {
        field.addEventListener("input", function(e) {
            if (e.target.value.length>0) {
                e.target.parentNode.classList.add("filled")
            }
        })
        field.addEventListener("focusin", function(e) {
            e.target.parentNode.classList.add("filled")
        })
        field.addEventListener("focusout", function(e) {
            if (e.target.value.length==0)
            e.target.parentNode.classList.remove("filled")
        })
        if (field.value.length>0) {
            field.parentNode.classList.add("filled")
        }
    })

    try {
        await myIndexedDB.startDB("user")
    } catch (err) {
        document.querySelector("button.discord").disabled = true
        document.querySelector("button.discord").classList.add("disabled")
        destroyLoader()
        console.error(err)
        return console.warn("Error en la base de datos")
    }

    log = new login();

    list_length = await myIndexedDB.listLength("data", 1)
    if (list_length) {
        let data_log = await myIndexedDB.displayData("data")
        let guilds_log = await myIndexedDB.displayData("guilds")
        await sleep(500)
        log.load(data_log[0], guilds_log)
    }

    if (log.token == undefined || log.token == "") {
        await log.fetch()
    }

    loggeduser = log.buildUser()

    if (loggeduser != undefined) {
        if (loggeduser.data.expiration < Date.now()) {
            /*
            document.querySelector(".login").classList.remove("hidden")
            document.querySelector(".logout").classList.add("hidden")
            */
        } else {
            //loggeduser.loadUser()
            /*
            document.querySelector(".login").classList.add("hidden")
            document.querySelector(".logout").classList.remove("hidden")
            */
            loggeduser.save()
        }
    } else {
        /*
        document.querySelector(".login").classList.remove("hidden")
        document.querySelector(".logout").classList.add("hidden")
        */
    }

    if (window.location.href.split("#").length > 1) {
        window.location = window.location.href.split("#")[0]
    }

    document.getElementById("staffhelpcheck").addEventListener("change", function(e) {
        if (e.target.checked) {
            document.getElementById("staffhelpdiv").style.opacity = "1"
            document.getElementById("staffhelpdiv").style.visibility = "visible"
            document.getElementById("staffhelpdiv").style.height = "60px"
        } else {
            document.getElementById("staffhelpdiv").style.opacity = "0"
            document.getElementById("staffhelpdiv").style.visibility = "hidden"
            document.getElementById("staffhelpdiv").style.height = "0px"
        }
    })

    generalLoader.destroy()
}

window.oncontextmenu = function () { return false }