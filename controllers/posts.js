const { dbQuery } = require('../database/config');
const cloudinary = require('cloudinary').v2;
cloudinary.config( process.env.CLOUDINARY_URL );

const obtenerPostById = async( req, res  ) => {
    const { id } = req.params;

    const [ respuesta ] = await dbQuery( "SELECT * FROM posts INNER JOIN usuarios ON posts.uid = usuarios.uid WHERE id = ?", id);
    const post = { ...respuesta };

    res.json({
        post
    });
}


const obtenerPost = async( req, res ) => {

    /*
    const { limite = 50 , desde = 0 } = req.query;
    */

    const posts = await dbQuery('SELECT * FROM posts INNER JOIN usuarios ON posts.uid = usuarios.uid');

    res.json({
        posts
    });

}

const guardarPost = async( req , res ) => {
    
    let secureUrl = '';

    if( !! req.files === true ){
        try {
            const { tempFilePath } = req.files.file
            const { secure_url } = await cloudinary.uploader.upload( tempFilePath );
            secureUrl = secure_url;

        } catch (err) {
            console.log(err);
        }
    }

    const { title, description, contenido } = req.body;
    
    const post = {
        postTitle: title,
        postDescription: description,
        postContent:contenido,
        uid: req.usuario.uid,
        postImg: secureUrl
    }

    try {
        await dbQuery('INSERT INTO posts SET ?', post );

        // console.log( 'post añadido' , post );
    
        res.json({
            msg: 'Post posteado',
            post
        });
    } catch (error) {
        console.log( error );
    }

}


module.exports = {
    guardarPost,
    obtenerPost,
    obtenerPostById
}