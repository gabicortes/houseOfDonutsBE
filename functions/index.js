const functions = require("firebase-functions");
const axios = require("axios").default;
const config = require("./config");
const cors = require("cors")({ origin: true });

let token = config.first_token;

// cuando le pegamos a servidor.firbase.com/photos (onRequest - GET, POST, PUT, etc.)
// ejecuta la funcion:
exports.photos = functions.https.onRequest(async (request, response) => {
  // cors habilita que le podamos pegar desde afuera del servidor a /photos
  cors(request, response, async () => {
    // intenta:
    try {
      // bancame que voy a buscar a las fotos a instagram, no bloquees el procesador (eso es await)
      const photosResponse = await axios.get(
        `https://graph.instagram.com/me/media?fields=media_url,permalink,comments_count&access_token=${token}`
      );

      // solo si salio bien el request
      response.send(photosResponse.data);
    } catch (error) {
      // si sale mal el request, llegamos aca
      console.log(error);

      response.send(error);
    }
  });
});

// pubsub es lo que usa firebase para schedulear funciones
exports.refreshToken = functions.pubsub
  .schedule("every 480 hours")
  .onRun(async (context) => {
    try {
      const refreshResponse = await axios.get(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
      );

      token = refreshResponse.data.access_token;

      console.log("Successfully updated token", { token });
    } catch (error) {
      console.log(error);
    }

    return null;
  });
