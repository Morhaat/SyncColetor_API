const sequelize = require("../database");
const Webhook = require("./Webhooks");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Log = require("../models/Log");

module.exports = {
    async store(req, res){
        const { externalId, status, location, items } = req.body;
    
        if (!status || !location || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Status, localização e itens são obrigatórios" });
        }
        
        const transaction = await sequelize.transaction();//inicia a transação para garantir que tanto o pedido como os items sejam gravados.
        
        try{
            const order = await Order.create({ externalId, status, location }, {transaction});
    
            const orderItems = await Promise.all(
                items.map((item) => OrderItem.create(
                    {
                        orderId: order.id,
                        sku:item.sku,
                        ean:item.ean,
                        nome:item.nome,
                        quantity:item.quantity,
                        location:item.location,
                    },
                    {transaction}
                ))
            );

            const logOrder = await Log.create({
                acao:"create",
                campos_utilizados:"order, orderItem",
                reference_id:order.id,
                usuario:req.user.usuario,
            }, {transaction});
    
            await transaction.commit();
            res.status(201).json({
                status:true,
                data:{order, items:orderItems, logOrder},
                message:"Pediso cadastrado com sucesso!"
            });
        }catch(error){
            await transaction.rollback();
    
            console.error("Erro ao criar pedido:", error);
            res.status(500).json({ 
                status:false,
                data:null,
                message: "Erro ao criar pedido"
            });
        }
    },

    async storeList(req, res){
        const {orderList} = req.body;
        let contador = {total:orderList.length, processado:0};
        if (!Array.isArray(orderList) || orderList.length === 0){
            return res.status(400).json({ error: "Lista com os pedidos obrigatório" });   
        }

        const transaction = await sequelize.transaction();
        try {
            const allOrders = await Promise.all(
                orderList.map(async (e)=> {
                    const verifyOrder = await Order.findOne({externalId:e.externalId});
                    console.log(verifyOrder);
                    if (!verifyOrder){
                        const currentOrder = await Order.create({
                            externalId : e.externalId, 
                            status:e.status, 
                            location:e.location,
                        }, {transaction});
                        
                        await Promise.all(
                            e.items.map((item) => OrderItem.create(
                                {
                                    orderId: currentOrder.id,
                                    sku:item.sku,
                                    ean:item.ean,
                                    nome:item.nome,
                                    quantity:item.quantity,
                                    location:item.location,
                                },
                                {transaction}
                            ))
                        );
                        const logOrder = await Log.create({
                            acao:"create",
                            campos_utilizados:"order, orderItem",
                            reference_id:e.id,
                            usuario:req.user.usuario,
                        }, {transaction});
                        contador.processado += 1;               
                    } 
                }
                )
            );

            await transaction.commit(); // Confirma a transação
            res.status(201).json({ message: `Operação realizada com sucesso! ${contador.processado} de ${contador.total} pedidos processados` });

        } catch (error) {
            await transaction.rollback();
    
            console.error("Erro ao criar pedido:", error);
            res.status(500).json({ error: "Erro ao criar pedido"});    
        }
    },
    
    async index(req, res){
        try {
            const { id, status } = req.query;
            const parametro = {};
            if(id){parametro.id = id}
            if(status){parametro.status = status}
            //console.log(parametro);
            const orders = await Order.findAll({where:parametro});
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar pedido"}); 
        }
    },

    async update(req, res){
        try {
            const { id } = req.params;
            const { status } = req.body;
            
        
            if (!status) return res.status(400).json({
                status:false,
                data:null,
                message: "Status é obrigatório"
            });
        
            const order = await Order.findByPk(id);
            if (!order) return res.status(404).json({
                status:false,
                data:null,
                message:"Pedido não encontrado"
            });
        
            order.status = status;
            const status_pedido = {
                status_pedido:status
            }
            await order.save();
        
            // Disparar webhook
            Webhook.sendWebhook("order.updated", { numero_pedido:order.externalId, status_pedido:status_pedido});

            const logOrder = await Log.create({
                acao:"update",
                campos_utilizados:"status_pedido",
                reference_id: order.id,
                usuario:req.user.usuario,
            });
        
            res.status(200).json({ 
                status:true,
                data:{
                    order,
                    logOrder
                },
                message: "Pedido atualizado" 
            });            
        } catch (error) {
            res.status(500).json({
                status:false,
                data:null,
                message:error.message
            });
        }
    },
    async updateList(req, res){
        try {
            const { status, data } = req.body;
        
            if (!Array.isArray(data) || data.length === 0) {
                return res.status(400).json({
                    status: false,
                    data: null,
                    message: "Lista de pedidos obrigatória"
                });
            }

            if (!status) {
                return res.status(400).json({
                    status: false,
                    data: null,
                    message: "Status obrigatório"
                });
            }
        
            const pedidosAtualizados = [];

            for (const pedido of data) {
                const { orderId } = pedido;
    
                const order = await Order.findByPk(orderId);
                if (!order) continue; // Ignora pedidos não encontrados
    
                order.status = status;
                await order.save();
    
                // Disparar webhook por pedido
                const status_pedido = { status_pedido: status };
                Webhook.sendWebhook("order.updated", {
                    numero_pedido: order.externalId,
                    status_pedido: status_pedido
                });
    
                pedidosAtualizados.push(order);

                const logOrder = await Log.create({
                    acao:"update",
                    campos_utilizados:"status_pedido",
                    reference_id: order.id,
                    usuario:req.user.usuario,
                });
            }
            res.status(200).json({ 
                status:true,
                data:pedidosAtualizados,
                message: "Pedidos atualizados com sucesso" 
            });            
        } catch (error) {
            res.status(500).json({
                status:false,
                data:null,
                message:error.message
            });
        }
    }
};