const sequelize = require("../database");
const {Op} = require("sequelize");
const Webhook = require("./Webhooks");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Picking = require("../models/Picking");

module.exports = {  
    async index (req, res){
        try {
            const {type, id_picking, status, picker_user} = req.query;//Wave, Zone, Batch
            if(type ==="wave"){
                const filterPicking = {};
                filterPicking.type_picking = type;
                if(status){
                    filterPicking.status = status;
                }
                if(picker_user){
                    filterPicking.picker_user = picker_user;
                }
                if(id_picking){
                    filterPicking.id_picking = id_picking;
                    const picking_list = await Picking.findOne({ where: filterPicking });
                    if(!picking_list){
                        throw new Error("Tarefa não encontrada!");
                    }
                    const order_list = JSON.parse(picking_list.reference_id);
                    console.log(order_list);
                    const items = await OrderItem.findAll({
                        include: [
                        {
                            model: Order,
                            where: { 
                                status: 'aguardando_separacao',
                                externalId: {[Op.in]:order_list.orders}
                            },
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
                }

                const picking_list = await Picking.findAll({ where: filterPicking });
                
                return res.status(200).json({
                    status:true,
                    data:picking_list,
                    message:"Ok"
                });
            }else if(type ==="zone"){
                const filterPicking = {};
                filterPicking.type_picking = type;
                if(id_picking){
                    filterPicking.id_picking = id_picking;
                }
                if(status){
                    filterPicking.status = status;
                }
                const picking_list = await Picking.findAll({ where: filterPicking });
                //aqui é feita a preparação dos items separados em listas para cada zona de endereço, tipo rua A1, todos os itens dessa rua
                //agrupados em um array, e o objeto contendo todos as ruas disponíveis para separação é entregue na requisição
                return res.status(200).json({
                    status:true,
                    data:type,
                    message:"Ok"
                });
            }else if(type ==="batch"){
                const filterPicking = {};
                filterPicking.type_picking = type;
                if(id_picking){
                    filterPicking.id_picking = id_picking;
                }
                if(status){
                    filterPicking.status = status;
                }
                const picking_list = await Picking.findAll({ where: filterPicking });
                //aqui é feito o agrupamento dos itens de mesmo código em um só item somado a quantidade de cada pedido, e entregue na requisição
                //uma lista com todos os itens dos pedidos.
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
        return res.status(404).json({
            status:false,
            data:null,
            message:"EndPoint não implementado até o momento!"
        });
    },
    
    async update(req, res){
        try{
            const {id_picking, status} = req.query;
            if(!status){
                throw new Error("Status não enviado!");
            }

            const picking_one = await Picking.findOne({where:{id_picking}});
            
            if(!picking_one){
                throw new Error("Tarefa não encontrada!");
            }

            if(status === "em_separacao"){
                picking_one.status = status;
                picking_one.start_task = new Date();
                picking_one.picker_user = req.user.usuario;
                await picking_one.save();
                return res.status(200).json({
                    status:true,
                    data:picking_one,
                    message:"status alterado!"
                });
            }
            
            if(status === "separado"){
                picking_one.status = status;
                picking_one.end_task = new Date();
                await picking_one.save();
                return res.status(200).json({
                    status:true,
                    data:picking_one,
                    message:"status alterado!"
                });
            }

            if(status === "cancelado"){
                picking_one.status = "aguardando_separacao";
                picking_one.picker_user = null;
                picking_one.start_task = null;
                picking_one.end_task = null;
                await picking_one.save();
                return res.status(200).json({
                    status:true,
                    data:picking_one,
                    message:"status alterado!"
                });
            }

            return res.status(200).json({
                status:false,
                data:picking_one,
                message:"status alterado!"
            });

            
        } catch (error) {
            return res.status(500).json({
                status:false,
                data:null,
                message:error.message
            });
        }
    }
};