var log;
var loggeduser;

async function returnLoggedUser() {
    return loggeduser
}

window.onload = async function () {

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

    if (loggeduser != undefined && !(loggeduser.data.expiration < Date.now())) {
        loggeduser.loadUser()
        document.getElementById("error").style.opacity = "0"
        document.getElementById("success").style.opacity = "1"
        document.getElementById("error").style.visibility = "hidden"
        document.getElementById("success").style.visibility = "visible"
        loggeduser.save()
    } else {
        document.getElementById("error").style.opacity = "1"
        document.getElementById("success").style.opacity = "0"
        document.getElementById("error").style.visibility = "visible"
        document.getElementById("success").style.visibility = "hidden"
    }

    if (window.location.href.split("#").length > 1) {
        window.location = window.location.href.split("#")[0]
    }

    generalLoader.destroy()
}

window.oncontextmenu = function(){return false}