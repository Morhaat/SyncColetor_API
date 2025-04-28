const sequelize = require("../database");
const PreSend = require("../models/PreSend");



module.exports = {
    async index(req, res){
        try {
            const {cabinet_code, bay_code, external_id, status} = req.query;
            const filtro = {};
            if(cabinet_code){
                filtro.cabinet_code = cabinet_code;
            }
            if(bay_code){
                filtro.bay_code = bay_code;
            }
            if(external_id){
                filtro.external_id = external_id;
            }
            if(status){
                filtro.status = status;
            }
            const buscaBaia = await PreSend.findOne({where:filtro});
            if(buscaBaia){

                return res.status(200).json({
                    status:buscaBaia.status == "Ocupado" ? false : true,
                    data:buscaBaia,
                    message:buscaBaia.status == "Ocupado" ? `Baia se encontra ocupada por outro pedido de nº: ${buscaBaia.external_id}` :
                    "Baia livre para alocação!"
                });
            }
            return res.status(400).json({
                status:false,
                data:null,
                message:"Baia não encontrada!"
            });
        } catch (error) {
            return res.status(500).json({
                status:false,
                data:null,
                message:error.message
            });   
        }
    },

    async store(req, res){
        try{
            const {cabinet_code, bay_code, external_id} = req.body;
            if(!cabinet_code && !bay_code){

                return res.status(400).json({
                    status:false,
                    data:null,
                    message:"necessário informar Armário e a Baia!"
                });
            }
            const Baia = await PreSend.create({
                cabinet_code,
                bay_code,
                status:"Livre"
            });
            return res.status(200).json({
                status:true,
                data:Baia,
                message:"Dados registrados!"
            });
        } catch (error) {
            return res.status(500).json({
                status:false,
                data:null,
                message:error.message
            });   
        }
    },

    async update(req, res){
        try {
            const {cabinet_code, bay_code, external_id} = req.body;
            const filtro = {};
            if(cabinet_code){
                filtro.cabinet_code = cabinet_code;
            }
            if(bay_code){
                filtro.bay_code = bay_code;
            }
            // const buscaBaia = await PreSend.findOne({where:filtro});
            // console.log(external_id);
            // if(buscaBaia){
            //     buscaBaia.external_id = external_id == undefined ? null : external_id;
            //     buscaBaia.status = external_id == undefined ? "Livre" : "Ocupado";
            //     await buscaBaia.save();
            //     return res.status(200).json({
            //         status:true,
            //         data:buscaBaia,
            //         message:"Alteração registrada!"
            //     });
            // }
            const [atualizaBaia] = await PreSend.update({
                external_id : external_id == undefined ? null : external_id,
                status : external_id == undefined ? "Livre" : "Ocupado"
            },{
                where: filtro
            })
            if(atualizaBaia > 0){

                return res.status(200).json({
                    status:true,
                    data:null,
                    message:"Alteração registrada!"
                });
            }
            return res.status(400).json({
                status:false,
                data:null,
                message:"Baia não encontrada!"
            });
        } catch (error) {
            return res.status(500).json({
                status:false,
                data:null,
                message:error.message
            });   
        }
    }
}