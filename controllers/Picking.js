const sequelize = require("../database");
const Webhook = require("./Webhooks");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

module.exports = {
    async index (req, res){
        try {
            const {type} = req.query;//Wave, Zone, Batch
            if(type ==="wave"){
                console.log(type);
                const items = await OrderItem.findAll({
                    include: [
                      {
                        model: Order,
                        where: { status: 'aguardando_separacao' },
                        required: true, // INNER JOIN
                        attributes: ['id', 'externalId', 'status'] // equivale a SELECT o.id, o.status
                      }
                    ],
                    order: [['location', 'ASC']]
                  });
                return res.status(200).json({
                    status:true,
                    data:items,
                    message:"Ok"
                });
            }else if(type ==="zone"){
                return res.status(200).json({
                    status:true,
                    data:type,
                    message:"Ok"
                });
            }else if(type ==="batch"){
                return res.status(200).json({
                    status:true,
                    data:type,
                    message:"Ok"
                });
            }
            return res.status(200).json({
                status:false,
                data:type,
                message:"Não validado"
            });
        } catch (error) {
            return res.status(500).json({
                status:false,
                data:null,
                message:error.message
            });
        }
    },

    async store (req, res){

    },
    
    async update(req, res){

    }
};