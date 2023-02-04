//const Usuario = require("../models/usuario");
const { dbQuery } = require('../db/config');

const bcryptjs = require("bcryptjs");

const cloudinary = require('cloudinary').v2
cloudinary.config( process.env.CLOUDINARY_URL );

const usuariosPost = async( req, res ) =>{
    let secureUrl = '';
    if( !!req.files === true ) {
        try {
            const { tempFilePath } = req.files.file
            const { secure_url } = await cloudinary.uploader.upload( tempFilePath );
            secureUrl = secure_url;

        } catch (err) {
            console.log(err);
        }
    }

    const { nombre, correo, password, role }  = req.body;

    const salt = bcryptjs.genSaltSync( 11 );

    const userPassword = bcryptjs.hashSync( password, salt);

    const usuario = { 
        userName : nombre,
        userEmail: correo,
        userPassword,
        userImg: secureUrl
    };

    try {
        await dbQuery('INSERT INTO usuarios SET ?', usuario );

        console.log( `Añadido:\n${ usuario }` );

        res.status(200).json({
            msg:'all good - post',
            usuario
        });

    } catch ( error ) {
        console.log( error );
        //Aqui colocare si fue un bad request
    }
}


const usuariosPut = async ( req , res= response ) => {

    console.log("entro aqui");

    const { uid } = req.usuario;

    const { newNombre, oldPassword, newPassword } = req.body;
    const [ respuesta ] = await dbQuery('SELECT * FROM usuarios WHERE uid = ?', uid );
    
    const { userPassword } = { ...respuesta };

    console.log( "respuesta", respuesta );
    console.log("userPassword", userPassword);

    const validPassword = bcryptjs.compareSync( oldPassword, userPassword );
    
    if(!validPassword){
        return res.status(400).json({
            msg: 'Contraseña invalida'
        });
    }

    const salt = bcryptjs.genSaltSync( 11 );

    const passwordEncrypted = bcryptjs.hashSync( newPassword, salt);

    await dbQuery( "UPDATE usuarios set userName = ?, userPassword = ? WHERE uid = ? ", [ newNombre, passwordEncrypted, uid ]);

    res.status(200).json({
        msg: "all-good"
    });
}


const usuariosDelete = ( req = require, res= response ) => {
    res.json({
        msg: 'all good - delete'
    });
}


module.exports = {
    usuariosPost,
    usuariosPut,
    usuariosDelete
}