const express = require('express');
const app = express();
const cors = require('cors');
const leerArchivo = require("./utils/leerArchivo");
const llamadaUrl = require("./utils/llamadaUrl");

const puerto = 3000;




app.use(cors());


//Ruta GET /api/items?q= :query
app.get('/api/items', async (req, res) => {
  const query = (req.query.q); //Lee el valor del parámetro 'query' en la ruta
  console.log("query",query);  
  let urlSearch = null;
  let respuesta = {};
  let categories = [];
  let items = [];
  let price = {};
  respuesta.author = {
    "name": "Juan",
    "lastname": "Rojas"
    };

  //leemos el archivo con las variables
  try {
    const data = await leerArchivo.readFile('variables.json');
    console.log('Contenido del archivo:', data);
    let variables = JSON.parse(data);
    urlSearch = variables.urlSearch   //url de busqueda
    console.log("urlSearch", urlSearch);
  } catch (err) {
    console.error('Error al leer el archivo:', err);
  }



  let urlExt = urlSearch+query;
  try {
    //llamada a la url de consulta
    const data = await llamadaUrl.callExternalURL(urlExt);
    console.log(data.paging);

    let item;
    let preItems={};
    let categorias = [];  //para el producto individual
    for (let i = 0; i < 4; i++) {
      item= data.results[i];
      preItems={};
      price = {};
      categorias = [];

      //completo el json a devolver
      preItems.id = item.id;
      preItems.title = item.title;
      preItems.picture = item.thumbnail;
      preItems.condition = item.condition;
      preItems.free_shipping = item.shipping.free_shipping; 
      price.currency = item.currency_id;
      price.amount = item.price;
      price.decimals = item.decimals?item.decimals:0;

      //para agregar las categorias
      for (let filter of data.filters) {
          if (filter.id == "category"){
            for (let value of filter.values) {
              categorias.push(value.name); //para el producto individual
              let categEncontrada = false;
              for (let categorie of categories) {
                if (categorie == value.name){
                  categEncontrada = true;
                }
              }
              if(!categEncontrada){
                categories.push(value.name);
              }
              
            }
          }
      }
      
      preItems.price = price;
      preItems.categorias = categorias;
      console.log("preItems", JSON.stringify(preItems))
      items.push(preItems);
      //items.price = price;
    }

    respuesta.categories = categories;
    respuesta.items = items;

    //res.json("OK");
  } catch (error) {
    console.error('Error en consulta o armar respuesta:', error);
  }


  if (respuesta) {
    console.log("respuesta",JSON.stringify(respuesta));
    res.json(respuesta);
  } else {
    res.status(404).json({ error: 'Evento no encontrado' });
  }
});







// Ruta GET /api/items/:id
app.get('/api/items/:id', async (req, res) => {
  const id = req.params.id;  //Lee el valor del parámetro 'id' en la ruta
  console.log("id",id);

  let urlId = null;  
  let respuesta = {};
  let item = {}
  let price = {};
  respuesta.author = {
    "name": "Juan",
    "lastname": "Rojas"
    };

  //leemos el archivo con las variables
  try {
    const data = await leerArchivo.readFile('variables.json');
    console.log('Contenido del archivo:', data);
    let variables = JSON.parse(data);
    urlId = variables.urlId   //url detalle por id
    console.log("urlId", urlId);
  } catch (err) {
    console.error('Error al leer el archivo:', err);
  }



  let urlExt = urlId+id;
  let urlExtDesc = urlId+id+"/description";

  try {
    //llamada a la url de consulta por id
    const data = await llamadaUrl.callExternalURL(urlExt);
    //llamada a la url de consulta por id/description
    const dataDesc = await llamadaUrl.callExternalURL(urlExtDesc);

    //completo el json a devolver
    item.id = data.id;
    item.title = data.title;
    item.pictures = data.pictures[0].url;
    item.condition = data.condition;
    item.free_shipping = data.shipping.free_shipping; 
    item.sold_quantity = data.sold_quantity;

    price.currency = data.currency_id;
    price.amount = data.price;
    price.decimals = data.decimals?data.decimals:0;

    item.price = price;
    item.description = dataDesc.plain_text;
    respuesta.item = item;


    //res.json("OK");
  } catch (error) {
    console.error('Error en las consultas y armar respuesta:', error);
  }




  if (respuesta) {
    res.json(respuesta);
  } else {
    res.status(404).json({ error: 'Evento no encontrado' });
  }

});





// Iniciar el servidor
app.listen(puerto, err => {
    if (err) {
        // Aquí manejar el error
        console.error("Error escuchando: ", err);
        return;
    }
    // Si no se detuvo arriba con el return, entonces todo va bien ;)
    console.log(`Escuchando en el puerto :${puerto}`);
});