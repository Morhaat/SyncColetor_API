const sequelize = require("../database");
const crypto = require("crypto");
const Webhook = require("../models/Webhook");

module.exports = {
    //Notificação aos webhooks cadastrados...............................................
    async sendWebhook(event, data){
        const webhooks = await Webhook.findAll({ where: { event } });
        webhooks
        .forEach(w =>{
            const payload = JSON.stringify(data);
            const signature = crypto.createHmac("sha256", process.env.WEBHOOK_KEY)
                                    .update(payload)
                                    .digest("hex");
            fetch(w.url, {
                method: "PATCH",
                headers:{
                    "Content-Type":"application/json",
                    "X-Signature": signature,
                },
                body:payload,
            })
            .then(async res => {
                const responseBody = await res.json(); // ou res.json(), se você espera JSON
                console.log({
                    status: true,
                    data: responseBody,
                    message:`Webhook enviado para ${w.url}, status: ${res.status}`
                });
            })
            .catch(err => {
                console.error({
                    status: true,
                    data: err,
                    message:`Erro ao enviar webhook para ${w.url}`
                });
            });
        })
    },

    async store(req, res){
        const {event, url} = req.body;
    
        if(!event || ! url){
            return res.status(400).json({error:"Evento e URL são obrigatórios"});
        }
        const verifyWebhook = await Webhook.findOne({ where: { event } });
        if (!verifyWebhook){
            const webhooks = await Webhook.create({ event, url });
            res.json({message:"Webhook registrado com sucesso", webhooks});
        }else{
            return res.status(400).json({error:"Webhook já existente!"});
        }
    },

    async get(req, res){
        const {event} = req.params;
        try{
            if(!event){
                const webhooks = await Webhook.findAll();
                return res.status(200).json({webhooks});
            }else{
                const webhooks = await Webhook.findAll({ where: { event } });
                return res.status(200).json({webhooks});   
            }
        }catch(err){
            return res.status(500).json({error:"Ocorreu um erro", message:err.message});
        }
    }
};