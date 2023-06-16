const axios = require('axios');

exports.callExternalURL = async function (url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (error.response) {
      // La solicitud fue realizada y el servidor respondió con un código de estado que no está en el rango 2xx
      console.error('Error de respuesta del servidor:', error.response.data);
      console.error('Código de estado:', error.response.status);
      throw new Error('Error de respuesta del servidor');
    } else if (error.request) {
      // La solicitud fue realizada pero no se recibió ninguna respuesta
      console.error('No se recibió respuesta del servidor');
      throw new Error('No se recibió respuesta del servidor');
    } else {
      // Ocurrió un error al configurar la solicitud
      console.error('Error al configurar la solicitud:', error.message);
      throw new Error('Error al configurar la solicitud');
    }
  }
}
