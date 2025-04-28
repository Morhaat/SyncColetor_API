const auth = require("basic-auth");
const sequelize = require("../database");
const user = require("../models/User");
const jwt = require("jsonwebtoken");


module.exports = {
    async login(req, res){
        const credentials = auth(req);
        //console.log(credentials);
        if(!credentials){
            return res.status(401).json({error:"Autenticação necessária"});
        }
        console.log(credentials);
        const dadoUsuario = await user.findOne({
            where: { usuario: credentials.name, senha: credentials.pass, ativo:"Ativo"},
        });

        if(!dadoUsuario){
            return res.status(401).json({error:"Usuário e senha incorretos!"});
        }

        payload = {
            nome: dadoUsuario.nome,
            sobrenome: dadoUsuario.sobrenome,
            usuario:dadoUsuario.usuario,
            setor:dadoUsuario.setor,
            nivel_acesso:dadoUsuario.nivel_acesso
        }

        const token = jwt.sign({payload}, process.env.JWT_SECRET, {expiresIn:"2h"});
        res.cookie("token", token, {
            httpOnly: true,
            secure:true,
            sameSite:'none',
            path:'/',
            maxAge:7200000,
        }).status(200).json({
            status:true,
            data:payload,
            message:"Login bem-sucedido!"
        });
    },

    logout(req, res){
        try{
            const token = req.cookies.token;
            if(!token){
                return res.status(400).json({
                status:false,
                data:null,
                message:"Token ausente"
                });
            }
            res.clearCookie("token", {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/'
            }).status(200).json({
                status:true,
                data:null,
                message:"Logout realizado!"
            });
        }catch(err){
            res.status(403).json({
                status:false,
                data:null,
                message:"Token invalido - " + err.message});
        }
    },

    validate(req, res){
        try{
            const token = req.cookies.token;
            if(!token){
                return res.status(400).json({
                status:false,
                data:null,
                message:"Token ausente"
                });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return res.status(200).json({
                status:true,
                data:decoded.payload,
                message:"valido!"
            });
        }catch(err){
            res.status(403).json({
                status:false,
                data:null,
                message:"Token invalido - " + err.message});
        }
    },
    authenticate(req, res, next){
        try{
            const token = req.cookies.token;
            if(!token){
                return res.status(400).json({
                status:false,
                data:null,
                message:"Token ausente"
                });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            //console.log(decoded);
            req.user = decoded.payload;
            next();
        }catch(err){
            res.status(403).json({
                status:false,
                data:null,
                message:"Token invalido - " + err.message});
        }
    }
};