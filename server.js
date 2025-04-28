require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sequelize = require("./database");
const Orders = require("./controllers/Orders");
const Webhooks = require("./controllers/Webhooks");
const UserControl = require("./controllers/UserControl");
const Picking = require("./controllers/Picking");
const cors = require('cors');
const PreSend = require("./controllers/PreSend");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cookieParser());

// sequelize.sync({ alter: true }).then(() => {
//     console.log("Banco de dados sincronizado!");
// });
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))


//ROTAS.............................................................................
app.get("/health", (req, res) =>{
    res.json({status:"API Online"});
});

app.post("/auth/login", UserControl.login);

app.post("/auth/logout", UserControl.logout);

app.post("/auth/validate", UserControl.validate);

app.post("/webhooks", UserControl.authenticate, Webhooks.store);

app.get("/webhooks", UserControl.authenticate, Webhooks.get);

app.get("/webhooks/:event", UserControl.authenticate, Webhooks.get);

app.post("/order", UserControl.authenticate, Orders.store);

app.post("/orders", UserControl.authenticate, Orders.storeList);

app.get("/orders", UserControl.authenticate, Orders.index);

app.get("/picking", UserControl.authenticate, Picking.index);

app.post("/picking", UserControl.authenticate, Picking.store);

app.patch("/picking", UserControl.authenticate, Picking.update);

app.patch("/update/:id", UserControl.authenticate, Orders.update);

app.patch("/update", UserControl.authenticate, Orders.updateList);

app.get("/presend", UserControl.authenticate, PreSend.index);

app.post("/presend", UserControl.authenticate, PreSend.store);

app.patch("/presend", UserControl.authenticate, PreSend.update);

//.................................................................................



app.listen(PORT, () =>{
    console.log(`Servidor rodando na porta ${PORT}`);
});