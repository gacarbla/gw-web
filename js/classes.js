class user {
  constructor(data, guilds) {
    this.data = data
    this.guilds = guilds
  }
  save() {
    if (myIndexedDB.has("data", `${this.data.id}`)) {
      myIndexedDB.deleteItem("data", `${this.data.id}`)
    }
    myIndexedDB.addElement("data", {
      id: this.data.id,
      token: this.data.token,
      expiration: this.data.expiration,
      avatar: this.data.avatar,
      username: this.data.username,
      discriminator: this.data.discriminator,
      mail: this.data.mail
    })
    this.guilds.forEach(async guild => {
      if (await myIndexedDB.has("guilds", guild.id)) {
        myIndexedDB.deleteItem("guilds", guild.id)
      }
      myIndexedDB.addElement("guilds", {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        owner: guild.owner,
        permissions: guild.permissions,
        features: typeof guild.features == Array ? guild.features.join(" ") : guild.features
      })
    })
  }
  async logOut() {
    new loader()
    myIndexedDB.reset("data")
    myIndexedDB.reset("guilds")
    await sleep(2500)
    window.location = window.location.href.split("#")[0]
  }
  loadUser() {
    try {
      document.getElementById("user_username").innerHTML = this.data.username
      try {
        document.getElementById("user_img").src = `https://cdn.discordapp.com/avatars/${this.data.id}/${this.data.avatar}.jpg`;
        console.info("Información del usuario montada con éxito")
      } catch {
        console.warn("No ha sido posible obtener el usuario")
      }
    } catch {
      console.warn("No ha sido posible obtener el usuario")
    }
  }
}

class login {
  constructor() {
    this.token = "";
    this.expiration = "";
    this.username = "";
    this.discriminator = "";
    this.id = "";
    this.avatar = "";
    this.guilds = [];
    this.page = 'https://discord.com/api/oauth2/authorize?client_id=1109945400066060399&redirect_uri=http%3A%2F%2F127.0.0.1%3A5500%2F&response_type=token&scope=identify%20guilds'
  }
  async fetch() {
    try {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const token = fragment.get('token_type') ? `${fragment.get('token_type')} ${fragment.get('access_token')}` : data.obtener("user_token");

      if (!token || token == " ") return

      console.info("Iniciando conexión con la API de Discord")

      await fetch('https://discord.com/api/users/@me', {
        headers: {
          authorization: token,
        },
      }).then(result => result.json())
        .then(async response => {
          console.info("Conexión con la API de Discord exitosa")
          this.token = token;
          console.info("Obteniendo servidores")
          await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
              authorization: token,
            },
          }).then(guilds => guilds.json())
            .then( async guilds => {
              console.info("Obteniendo base de datos")
              console.info("Base de datos obtenida")
              console.info("Servidores obtenidos")
              console.info("Guardando servidores")
              this.expiration = Math.floor((parseInt(fragment.get('expires_in'))*1000) + Date.now());
              this.username = response.username;
              this.discriminator = response.discriminator;
              this.id = response.id;
              this.avatar = response.avatar;
              this.guilds = guilds;
              console.info("Servidores guardados")
            }).catch(console.error);
        }).catch(console.error);

    } catch (err) {
      document.querySelector("button.discord").disabled = true
      document.querySelector("button.discord").classList.add("disabled")
      console.warn("No ha sido posible conectarse a la API de Discord")
      console.error(err)
    }
  }
  load(data, guilds) {
    console.info("Reconstruyendo información")
    try {
      this.token = data.token;
      this.expiration = data.expiration;
      this.username = data.username;
      this.discriminator = data.discriminator;
      this.id = data.id;
      this.avatar = data.avatar;
      this.guilds = guilds;
      console.info("Información reconstruída")
    } catch (err) {
      console.error(err)
      console.warn("No ha sido posible reconstruír la información")
    }
  }
  buildUser() {
    if (parseInt(this.expiration) > Date.now()) return new user({
      token: this.token,
      expiration: parseInt(this.expiration) - 100,
      id: this.id,
      username: this.username,
      discriminator: this.discriminator,
      avatar: this.avatar,
    }, this.guilds)

    console.warn("LOGIN CADUCADO!")
    return undefined
  }
}

const myIndexedDB = {
  db: undefined,
  startDB() {
    return new Promise(async resolve => {
      let request = window.indexedDB.open("user", 1);
      request.onerror = function () {
        console.error("No se pudo abrir la base de datos");
      };
      request.onsuccess = function () {
        console.info("Base de datos abierta con éxito");
        myIndexedDB.db = request.result;
        resolve()
      };
      request.onupgradeneeded = function (e) {
        myIndexedDB.db = e.target.result;
        myIndexedDB.addsheet("guilds", [
          { name: "name", unique: false },
          { name: "icon", unique: false },
          { name: "owner", unique: false },
          { name: "permissions", unique: false },
          { name: "features", unique: false }
        ])
        myIndexedDB.addsheet("data", [
          { name: "value", unique: false }
        ])
      };
    })
  },
  addsheet(name, fields) {
    let objectStore = myIndexedDB.db.createObjectStore(name, {
      keyPath: "id",
      autoIncrement: false,
    });
    fields.forEach(field => {
      objectStore.createIndex(field.name, field.name, { unique: field.unique });
    });
    console.info("Configuración de la base de datos completa");
  },
  addElement(sheet, element) {
    let transaction = myIndexedDB.db.transaction([sheet], "readwrite");
    let objectStore = transaction.objectStore(sheet);
    let request = objectStore.add(element);
    transaction.onerror = function () { console.error("Transacción fallida"); };
  },
  displayData(sheet) {
    return new Promise(function (resolve, reject) {
      try {
        let toShow = []
        let objectStore = myIndexedDB.db.transaction(sheet).objectStore(sheet);
        objectStore.openCursor().onsuccess = function (e) {
          let cursor = e.target.result;
          if (cursor) {
            toShow.push(cursor.value)
            cursor.continue();
          }
        };
        resolve(toShow)
      } catch (err) {
        reject(err)
      }
    })
  },
  deleteItem(sheet, id) {
    let transaction = myIndexedDB.db.transaction([sheet], "readwrite");
    let objectStore = transaction.objectStore(sheet);
    try {
      let request = objectStore.delete(id);
    } catch (err) {
      console.error(err)
    }
    transaction.onerror = function () { console.error("Transacción fallida") }
  },
  async has(sheet, id) {
    return new Promise(async resolve => {
      const list = await myIndexedDB.displayData(sheet)
      await sleep(500)
      var i = 0
      for (i = 0; i < list.length; i++) {
        if (list[i].id == id) {
          resolve(true)
        }
      }
      resolve(false)
    })
  },
  async listLength(sheet, min, max) {
    return new Promise(async function (resolve, reject) {
      if (!sheet) return console.error("Tabla no especificada")
      const list = await myIndexedDB.displayData(sheet)
      await sleep(500)
      if (!min && !max) {
        resolve(list.length)
      } else if (min > 0 && max >= 0 && list.length >= min && list.length <= max) {
        resolve(true)
      } else if (min >= 0 && list.length >= min && !max) {
        resolve(true)
      } else if (max >= 0 && list.length <= max && !min) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  },
  async reset(sheet) {
    const list = await myIndexedDB.displayData(sheet)
    await sleep(500)
    var i = 0
    for (i = 0; i < list.length; i++) {
      myIndexedDB.deleteItem(sheet, list[i].id)
    }
  }
}

const data = {
  eliminar(ruta) {
    localStorage.removeItem(`${ruta}`);
    return localStorage
  },
  establecer(ruta, valor) {
    localStorage.setItem(`${ruta}`, valor);
    return
  },
  existe(ruta) {
    if (localStorage[`${ruta}`]) return true;
    return false;
  },
  obtener(ruta) {
    return localStorage.getItem(`${ruta}`);
  },
  reset() {
    localStorage.clear();
  },
  table() {
    return console.table(localStorage)
  }
}

async function require(url, canonical) {
  return new Promise(async resolve => {
    var response = await fetch(`${canonical ? `${window.location.href.split("/")[0]}/${url}` : `${url}`}`);
    if (window.location.href.startsWith("http://127.0.0.1:5501/")) response = await fetch(`${canonical ? `http://127.0.0.1:5501/${url}` : `${url}`}`);
    const json = await response.json();
    resolve(json)
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class loader {
  constructor(elementQuery) {
    try {
      elementQuery = elementQuery||"body"
      this.element = document.createElement("div")
      document.querySelector(elementQuery).appendChild(this.element)
      this.element.innerHTML = `<div class="loader-background${elementQuery=="body"?"":" sticky"}"><div class="progress-loader"><div class="progress"></div></div></div>`
      console.info("Loader cargado con éxito")
    } catch {
      console.error("No ha sido posible cargar el loader")
    }
  };
  destroy() {
    try {
      this.element.parentNode.removeChild(this.element)
      console.info("Loader retirado con éxito")
    } catch (err) {
      console.warn("No se pudo retirar el loader")
      console.error(err)
    }
  };
}