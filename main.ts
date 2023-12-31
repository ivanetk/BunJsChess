// import packages
import express from "express";
import morgan from "morgan";
import { engine } from "express-handlebars";
import { v4 as uuidv4 } from "uuid";
import { EventSource } from "express-ts-sse";

// default to 3000 if PORT env not set
const port = process.env.PORT || 3000;

// Create an instance of SSE
const sse = new EventSource()

// create an instance of the app
const app = express();

// Configure render
app.engine("html", engine({ defaultLayout: false }));
app.set("view engine", "html");

// Logger
app.use(morgan("combined"));

// Post
app.post("/chess", express.urlencoded({ extended: true }), (req, resp) => {
  const gameId = uuidv4().substring(0, 8);
  const orientation = "white";

  resp.status(200).render("chess", { gameId, orientation });
});

// GET /chess?gameId=
app.get("/chess", (req, resp) => {
  const gameId = req.query.gameId;
  const orientation = "black";
  resp.status(200).render("chess", { gameId, orientation });
});

// PATCH /chess/:gameId
app.patch("/chess/:gameId", express.json(), (req, resp) => {
  // Get the gameId from the resource
  const gameId = req.params.gameId;
  const move = req.body;

  console.info(`GameId: ${gameId}: `, move);
  // Should stringify the data. in this case, sse library already stringify for us
  sse.send({
    event: gameId, data: move
  })

  resp.status(201).json({ timestamp: new Date().getTime() });
});

// GET /chess/stream
app.get('/chess/stream', sse.init)

// Serve files from static
app.use(express.static(__dirname + "/static"));

// Start express
app.listen(port, () => {
  console.log(`Application bound to port ${port} at ${new Date()}`);
});
